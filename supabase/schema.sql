-- 포춘팟: 사주 프로필 테이블 + RLS
-- Supabase 대시보드 > SQL Editor 에 붙여넣어 실행하세요.

create table if not exists public.saju_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  birth_date date not null,
  hour_idx   int  check (hour_idx between 0 and 11),  -- 0(자)~11(해), 모르면 null
  gender     text not null check (gender in ('남','여')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_saju_touch on public.saju_profiles;
create trigger trg_saju_touch before update on public.saju_profiles
  for each row execute function public.touch_updated_at();

-- Row Level Security: 본인 데이터만 접근
alter table public.saju_profiles enable row level security;

drop policy if exists "select own" on public.saju_profiles;
drop policy if exists "insert own" on public.saju_profiles;
drop policy if exists "update own" on public.saju_profiles;
drop policy if exists "delete own" on public.saju_profiles;

create policy "select own" on public.saju_profiles for select using (auth.uid() = user_id);
create policy "insert own" on public.saju_profiles for insert with check (auth.uid() = user_id);
create policy "update own" on public.saju_profiles for update using (auth.uid() = user_id);
create policy "delete own" on public.saju_profiles for delete using (auth.uid() = user_id);
