/**
 * 数据源抽象接口
 * 定义统一的数据获取契约，支持 Mock、阿里云等多种实现
 * 所有数据源实现类都必须遵循这个接口
 */

import type { 
  DailyMetric, 
  ComparisonResult, 
  FunnelData, 
  MetricsResponse 
} from '../../types';

/**
 * 数据源接口 - 定义所有数据获取方法的标准签名
 */
export interface IDataSource {
  /**
   * 获取指标数据
   * @param moduleCode - 模块代码 (e.g., 'photo_inventory')
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param period - 统计粒度 ('day' | 'week' | 'month')
   * @param useStatic - 是否使用静态数据（演示模式）
   */
  fetchMetrics(
    moduleCode: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
    useStatic?: boolean
  ): Promise<DailyMetric[]>;

  /**
   * 获取对比分析数据
   * @param moduleCode - 模块代码
   * @param metricName - 指标名称
   * @param period1Start - 对比期间1开始日期
   * @param period1End - 对比期间1结束日期
   * @param period2Start - 对比期间2开始日期
   * @param period2End - 对比期间2结束日期
   */
  fetchComparison(
    moduleCode: string,
    metricName: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<ComparisonResult>;

  /**
   * 获取转化漏斗数据
   * @param moduleCode - 模块代码
   * @param startDate - 可选的开始日期
   * @param endDate - 可选的结束日期
   */
  fetchFunnel(
    moduleCode: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FunnelData>;

  /**
   * 获取所有模块的概览数据
   * @param date - 指定日期
   */
  fetchModuleOverview(date: Date): Promise<Record<string, any>>;

  /**
   * 获取模块指标平均值 (7天/15天)
   * @param moduleCode - 模块代码
   */
  fetchModuleAverages(moduleCode: string): Promise<any>;

  /**
   * 获取模块的所有指标完整响应
   * @param moduleCode - 模块代码
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param period - 统计粒度
   * @param useStatic - 是否使用静态数据
   */
  fetchMetricsResponse(
    moduleCode: string,
    startDate: Date,
    endDate: Date,
    period: 'day' | 'week' | 'month',
    useStatic?: boolean
  ): Promise<MetricsResponse>;
}

/**
 * 数据源工厂类
 * 用于创建和管理不同的数据源实现
 */
export class DataSourceFactory {
  private static instances: Map<string, IDataSource> = new Map();

  /**
   * 注册数据源实现
   * @param name - 数据源名称 (e.g., 'mock', 'aliyun')
   * @param instance - 数据源实例
   */
  static register(name: string, instance: IDataSource): void {
    this.instances.set(name, instance);
  }

  /**
   * 获取数据源实例
   * @param name - 数据源名称
   */
  static get(name: string): IDataSource {
    const instance = this.instances.get(name);
    if (!instance) {
      throw new Error(`数据源 "${name}" 未注册`);
    }
    return instance;
  }

  /**
   * 获取所有注册的数据源
   */
  static getAll(): Map<string, IDataSource> {
    return this.instances;
  }

  /**
   * 清除所有实例（用于测试）
   */
  static clear(): void {
    this.instances.clear();
  }
}

/**
 * 当前激活的数据源引用
 */
let activeDataSource: IDataSource | null = null;

/**
 * 设置激活的数据源
 * @param dataSource - 数据源实例或名称
 */
export function setActiveDataSource(dataSource: IDataSource | string): void {
  if (typeof dataSource === 'string') {
    activeDataSource = DataSourceFactory.get(dataSource);
  } else {
    activeDataSource = dataSource;
  }
}

/**
 * 获取激活的数据源
 */
export function getActiveDataSource(): IDataSource {
  if (!activeDataSource) {
    throw new Error('未设置激活的数据源');
  }
  return activeDataSource;
}
