/**
 * Mock 数据源实现
 * 实现 IDataSource 接口，基于现有的 mockData.ts 逻辑
 */

import type { IDataSource } from './interface';
import type { DailyMetric, ComparisonResult, FunnelData, MetricsResponse } from '../../types';
import {
  getMockMetrics,
  getMockComparison,
  getMockFunnelData,
  getMockModuleOverview,
  getMockModuleAverages,
  getMockInsights,
  getPredictiveMetrics,
  getMockProvinceData,
  getMockProvinceTimeSeries,
} from '../mockData';

/**
 * Mock 数据源实现类
 * 提供本地生成的模拟数据，用于开发和演示
 */
export class MockDataSource implements IDataSource {
  /**
   * 数据源名称
   */
  static readonly NAME = 'mock';

  /**
   * 获取指标数据
   */
  async fetchMetrics(
    moduleCode: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' = 'day',
    useStatic: boolean = false
  ): Promise<DailyMetric[]> {
    // 模拟网络延迟 (100-300ms)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    let metrics = getMockMetrics(moduleCode, startDate, endDate, period, useStatic);

    // 添加预测数据
    if (metrics.length > 0) {
      const lastMetric = metrics[metrics.length - 1];
      // 只添加一条预测数据（使用 5 天的平均增长）
      const predictions = getPredictiveMetrics(lastMetric, 1);
      metrics = [...metrics, ...predictions];
    }

    return metrics;
  }

  /**
   * 获取对比分析数据
   */
  async fetchComparison(
    moduleCode: string,
    metricName: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<ComparisonResult> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return getMockComparison(
      moduleCode,
      metricName,
      period1Start,
      period1End,
      period2Start,
      period2End
    );
  }

  /**
   * 获取转化漏斗数据
   */
  async fetchFunnel(
    moduleCode: string,
    startDate?: Date
  ): Promise<FunnelData> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return getMockFunnelData(moduleCode, startDate);
  }

  /**
   * 获取所有模块的概览数据
   */
  async fetchModuleOverview(date: Date): Promise<Record<string, any>> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return getMockModuleOverview(date);
  }

  /**
   * 获取模块指标平均值 (7天/15天)
   */
  async fetchModuleAverages(moduleCode: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return getMockModuleAverages(moduleCode);
  }

  /**
   * 获取省份维度的数据（用于地图展示和省份对比）
   */
  async fetchProvinceData(
    moduleCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ province: string; value: number; percentage: number }>> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return getMockProvinceData();
  }

  /**
   * 获取特定省份的时间序列数据（用于热力图趋势）
   */
  async fetchProvinceTimeSeries(
    moduleCode: string,
    province: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; value: number }>> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    return getMockProvinceTimeSeries(province, startDate, endDate);
  }

  /**
   * 获取完整的指标响应（包含见解）
   */
  async fetchMetricsResponse(
    moduleCode: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month' = 'day',
    useStatic: boolean = false
  ): Promise<MetricsResponse> {
    const metrics = await this.fetchMetrics(moduleCode, startDate, endDate, period, useStatic);

    return {
      module: moduleCode,
      period,
      metrics,
    };
  }

  /**
   * 获取业务见解
   */
  async getInsights(moduleCode: string, metrics: DailyMetric[]): Promise<string[]> {
    return Promise.resolve(getMockInsights(moduleCode, metrics));
  }
}
