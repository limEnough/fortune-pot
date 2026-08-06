"use client";
import { create } from "zustand";

interface UIState {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /** 전역 로딩 오버레이 노출 여부 */
  loading: boolean;
  /** 최소 노출 시간 계산용 시작 시각 */
  loadingSince: number;
  /**
   * 로딩을 시작한 경로. 여기서 벗어나면 "도착"으로 보고 오버레이를 내린다.
   * null이면 경로 변화와 무관하게 stopLoading()을 기다린다.
   */
  loadingFrom: string | null;
  startLoading: (from?: string | null) => void;
  stopLoading: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  loading: false,
  loadingSince: 0,
  loadingFrom: null,
  startLoading: (from = null) =>
    set({ loading: true, loadingSince: Date.now(), loadingFrom: from }),
  stopLoading: () => set({ loading: false, loadingFrom: null }),
}));
