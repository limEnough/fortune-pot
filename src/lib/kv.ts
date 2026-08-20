/*
 * 아주 작은 KV 어댑터 — 귀인지도만 서버에 남는다.
 *
 * 운영에서는 Vercel KV(Upstash Redis)의 REST API 를 `fetch` 로 직접 부른다.
 * `@vercel/kv` 나 `@upstash/redis` 를 넣지 않은 건 쓰는 명령이 여섯 개뿐이고,
 * 이 저장소는 사내망에서 npm 설치가 막히는 일이 있어 의존성을 늘리지 않기로
 * 했기 때문이다(README 의 폰트 항목과 같은 이유).
 *
 * 로컬 개발에는 환경변수가 없다. 그때는 `.data/kv.json` 파일로 흉내 낸다 —
 * `npm run dev` 를 환경변수 없이 그대로 띄울 수 있어야 하기 때문이다.
 * 운영(NODE_ENV=production)에서 환경변수가 비어 있으면 조용히 파일로 흐르지
 * 않고 에러를 낸다. 서버리스 파일시스템은 요청마다 날아가서, 저장된 것처럼
 * 보이다가 사라지는 게 제일 나쁘다.
 */

const REST_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvRemote = !!(REST_URL && REST_TOKEN);

export class KvUnavailable extends Error {
  constructor() {
    super("KV_REST_API_URL / KV_REST_API_TOKEN 이 설정되지 않았습니다.");
    this.name = "KvUnavailable";
  }
}

/*
 * 설정이 빠진 건 사용자가 어쩔 수 없는 일이라 원인은 서버 로그에만 남긴다.
 * API 라우트(_fail.ts)와 공유 링크 페이지가 각각 같은 말을 적고 있었다 —
 * 고칠 방법을 알려주는 문장이라 두 벌로 갈리면 한쪽만 낡는다.
 */
export function logKvUnavailable() {
  console.error("[map] KV 환경변수가 없습니다 — Vercel 프로젝트에 KV 를 연결하세요.");
}

async function cmd<T>(args: (string | number)[]): Promise<T> {
  const res = await fetch(REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV ${args[0]} 실패 (${res.status})`);
  const json = (await res.json()) as { result?: T; error?: string };
  if (json.error) throw new Error(`KV ${args[0]} 실패: ${json.error}`);
  return json.result as T;
}

/* ---------------------------------------------------------------- 파일 흉내 */

type FileRec = { s?: string; h?: Record<string, string>; exp?: number };
type FileDb = Record<string, FileRec>;

const FILE = ".data/kv.json";

async function fs() {
  return import("node:fs/promises");
}

/*
 * 읽을 때마다 파일을 다시 연다. 메모리에 들고 있으면 빨라지지만, 라우트마다
 * 모듈 인스턴스가 갈릴 수 있어서(dev 의 핫리로드·번들 분리) 친구가 방금 올린
 * 글을 주인 쪽에서 못 보는 일이 생긴다. 개발용 폴백이라 속도보다 정확함이 먼저다.
 */
async function readDb(): Promise<FileDb> {
  try {
    const raw = await (await fs()).readFile(FILE, "utf8");
    return JSON.parse(raw) as FileDb;
  } catch {
    return {};
  }
}

async function writeDb(db: FileDb) {
  const f = await fs();
  await f.mkdir(".data", { recursive: true });
  await f.writeFile(FILE, JSON.stringify(db), "utf8");
}

/** 만료된 키는 읽는 김에 지운다 — 개발용이라 이 정도면 충분하다 */
function alive(db: FileDb, key: string): FileRec | null {
  const rec = db[key];
  if (!rec) return null;
  if (rec.exp && rec.exp < Date.now()) {
    delete db[key];
    return null;
  }
  return rec;
}

function ensureLocal() {
  if (process.env.NODE_ENV === "production") throw new KvUnavailable();
}

/* -------------------------------------------------------------------- 공개 */

export const kv = {
  async getJSON<T>(key: string): Promise<T | null> {
    if (kvRemote) {
      const raw = await cmd<string | null>(["GET", key]);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    ensureLocal();
    const db = await readDb();
    const rec = alive(db, key);
    return rec?.s ? (JSON.parse(rec.s) as T) : null;
  },

  async setJSON(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const s = JSON.stringify(value);
    if (kvRemote) {
      await cmd(ttlSec ? ["SET", key, s, "EX", ttlSec] : ["SET", key, s]);
      return;
    }
    ensureLocal();
    const db = await readDb();
    db[key] = { s, exp: ttlSec ? Date.now() + ttlSec * 1000 : undefined };
    await writeDb(db);
  },

  async hSetJSON(key: string, field: string, value: unknown): Promise<void> {
    const s = JSON.stringify(value);
    if (kvRemote) {
      await cmd(["HSET", key, field, s]);
      return;
    }
    ensureLocal();
    const db = await readDb();
    const rec = alive(db, key) ?? {};
    rec.h = { ...(rec.h ?? {}), [field]: s };
    db[key] = rec;
    await writeDb(db);
  },

  async hGetAllJSON<T>(key: string): Promise<Record<string, T>> {
    if (kvRemote) {
      // REST 는 [field, value, field, value, …] 평평한 배열로 준다
      const flat = (await cmd<string[] | null>(["HGETALL", key])) ?? [];
      const out: Record<string, T> = {};
      for (let i = 0; i + 1 < flat.length; i += 2) {
        out[flat[i]] = JSON.parse(flat[i + 1]) as T;
      }
      return out;
    }
    ensureLocal();
    const db = await readDb();
    const h = alive(db, key)?.h ?? {};
    const out: Record<string, T> = {};
    for (const [f, v] of Object.entries(h)) out[f] = JSON.parse(v) as T;
    return out;
  },

  async hDel(key: string, field: string): Promise<void> {
    if (kvRemote) {
      await cmd(["HDEL", key, field]);
      return;
    }
    ensureLocal();
    const db = await readDb();
    const rec = alive(db, key);
    if (!rec?.h) return;
    delete rec.h[field];
    await writeDb(db);
  },

  async expire(key: string, ttlSec: number): Promise<void> {
    if (kvRemote) {
      await cmd(["EXPIRE", key, ttlSec]);
      return;
    }
    ensureLocal();
    const db = await readDb();
    const rec = alive(db, key);
    if (!rec) return;
    rec.exp = Date.now() + ttlSec * 1000;
    await writeDb(db);
  },
};
