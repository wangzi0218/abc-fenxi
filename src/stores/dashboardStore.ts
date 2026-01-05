import { create } from 'zustand';
import dayjs from 'dayjs';
import type { ViewMode } from '../types';

interface DashboardState {
  // 时间相关
  selectedDate: Date;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  viewMode: ViewMode;
  
  // 模块选择
  selectedModule: string;
  selectedMetrics: string[];
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedModule: (module: string) => void;
  toggleMetric: (metric: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // 初始状态
  selectedDate: new Date(),
  dateRange: {
    startDate: dayjs().subtract(30, 'day').toDate(),
    endDate: new Date(),
  },
  viewMode: 'day',
  selectedModule: 'ai_diagnosis',
  selectedMetrics: [],
  isLoading: false,
  error: null,

  // Actions
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  
  setDateRange: (startDate: Date, endDate: Date) =>
    set({
      dateRange: { startDate, endDate },
    }),
  
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),
  
  setSelectedModule: (module: string) => set({ selectedModule: module }),
  
  toggleMetric: (metric: string) =>
    set((state: DashboardState) => {
      const metrics = state.selectedMetrics.includes(metric)
        ? state.selectedMetrics.filter((m: string) => m !== metric)
        : [...state.selectedMetrics, metric];
      return { selectedMetrics: metrics };
    }),
  
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),
  
  resetError: () => set({ error: null }),
}));

/**
 * 比较分析状态
 */
interface ComparisonState {
  // 对比参数
  module: string;
  metric: string;
  period1Start: Date;
  period1End: Date;
  period2Start: Date;
  period2End: Date;
  comparisonType: 'day' | 'week' | 'month';
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setModule: (module: string) => void;
  setMetric: (metric: string) => void;
  setPeriod1: (start: Date, end: Date) => void;
  setPeriod2: (start: Date, end: Date) => void;
  setComparisonType: (type: 'day' | 'week' | 'month') => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  // 初始状态
  module: 'ai_diagnosis',
  metric: 'adoption_rate',
  period1Start: dayjs().toDate(),
  period1End: new Date(),
  period2Start: dayjs().subtract(30, 'day').toDate(),
  period2End: dayjs().subtract(1, 'day').toDate(),
  comparisonType: 'day',
  isLoading: false,
  error: null,

  // Actions
  setModule: (module: string) => set({ module }),
  setMetric: (metric: string) => set({ metric }),
  setPeriod1: (start: Date, end: Date) => set({ period1Start: start, period1End: end }),
  setPeriod2: (start: Date, end: Date) => set({ period2Start: start, period2End: end }),
  setComparisonType: (type: 'day' | 'week' | 'month') => set({ comparisonType: type }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));

/**
 * 导出状态
 */
interface ExportState {
  format: 'excel' | 'csv' | 'json';
  isExporting: boolean;
  exportProgress: number;
  
  setFormat: (format: 'excel' | 'csv' | 'json') => void;
  setIsExporting: (exporting: boolean) => void;
  setExportProgress: (progress: number) => void;
}

export const useExportStore = create<ExportState>((set) => ({
  format: 'excel',
  isExporting: false,
  exportProgress: 0,
  
  setFormat: (format: 'excel' | 'csv' | 'json') => set({ format }),
  setIsExporting: (exporting: boolean) => set({ isExporting: exporting }),
  setExportProgress: (progress: number) => set({ exportProgress: progress }),
}));
