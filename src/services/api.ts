import type { ApiResponse, MetricsResponse, ComparisonResult, FunnelData } from '../types';
import type { IDataSource } from './datasource/interface';
import { DataSourceFactory } from './datasource/interface';
import { MockDataSource } from './datasource/mock';

/**
 * API 服务层 - 数据源适配器
 * 
 * 该层实现了"适配器模式"，可以无缝切换不同的数据源：
 * - Mock：本地生成的模拟数据（默认）
 * - Aliyun：阿里云数据源（待实现）
 * - 其他自定义数据源
 * 
 * 初始化：
 *   // 在应用启动时注册数据源
 *   const mockDataSource = new MockDataSource();
 *   DataSourceFactory.register('mock', mockDataSource);
 *   setActiveDataSource('mock');
 * 
 * 切换数据源：
 *   setActiveDataSource('aliyun');  // 切换到阿里云
 *   setActiveDataSource('mock');    // 切回 Mock
 */

// 初始化：注册 Mock 数据源
DataSourceFactory.register(MockDataSource.NAME, new MockDataSource());
// 设置默认数据源为 Mock
let activeDataSource: IDataSource = new MockDataSource();

/**
 * 设置活动的数据源
 * @param dataSource - IDataSource 实例或注册的数据源名称
 */
export function setDataSource(dataSource: IDataSource | string): void {
  if (typeof dataSource === 'string') {
    activeDataSource = DataSourceFactory.get(dataSource);
  } else {
    activeDataSource = dataSource;
  }
}

/**
 * 获取活动的数据源
 */
export function getDataSource(): IDataSource {
  return activeDataSource;
}

/**
 * 获取指标数据
 * GET /api/v1/metrics/:module
 */
export async function fetchMetrics(
  moduleCode: string,
  startDate: Date,
  endDate: Date,
  period: 'day' | 'week' | 'month' = 'day',
  useStatic: boolean = false
): Promise<ApiResponse<MetricsResponse>> {
  const metrics = await activeDataSource.fetchMetrics(
    moduleCode,
    startDate,
    endDate,
    period,
    useStatic
  );

  return {
    code: 0,
    data: {
      module: moduleCode,
      period,
      metrics,
    },
  };
}

/**
 * 获取对比分析数据
 * POST /api/v1/comparison
 */
export async function fetchComparison(
  moduleCode: string,
  metricName: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
): Promise<ApiResponse<ComparisonResult>> {
  const result = await activeDataSource.fetchComparison(
    moduleCode,
    metricName,
    period1Start,
    period1End,
    period2Start,
    period2End
  );

  return {
    code: 0,
    data: result,
  };
}

/**
 * 获取转化漏斗数据
 * GET /api/v1/funnel/:module
 */
export async function fetchFunnel(
  moduleCode: string,
  startDate?: Date,
  endDate?: Date
): Promise<ApiResponse<FunnelData>> {
  const funnel = await activeDataSource.fetchFunnel(moduleCode, startDate, endDate);

  return {
    code: 0,
    data: funnel,
  };
}

/**
 * 获取所有模块的概览数据
 * GET /api/v1/overview
 */
export async function fetchOverview(date: Date) {
  const overview = await activeDataSource.fetchModuleOverview(date);

  return {
    code: 0,
    data: overview,
  };
}

/**
 * 导出数据
 * POST /api/v1/export
 */
export async function exportData(
  _moduleCode: string,
  _startDate: Date,
  _endDate: Date,
  format: 'excel' | 'csv' | 'json'
) {
  // 模拟导出过程
  return new Promise<{ url: string }>((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // 生成下载链接（实际应该由后端返回）
        const mockUrl = `http://example.com/download/metrics_${Date.now()}.${
          format === 'excel' ? 'xlsx' : format
        }`;
        resolve({ url: mockUrl });
      }
    }, 500);
  });
}

/**
 * 获取模块指标平均值 (7天/15天)
 */
export async function fetchModuleAverages(moduleCode: string): Promise<ApiResponse<any>> {
  const data = await activeDataSource.fetchModuleAverages(moduleCode);
  return { code: 0, data };
}

/**
 * 错误处理
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '请求失败，请重试';
}
