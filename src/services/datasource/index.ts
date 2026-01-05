/**
 * 数据源导出和初始化
 * 
 * 这个文件集中管理所有数据源的导入和注册
 */

import { DataSourceFactory, setActiveDataSource } from './interface';
import { MockDataSource } from './mock';
import { AliyunDataSource } from './aliyun';

export type { IDataSource } from './interface';
export {
  DataSourceFactory,
  setActiveDataSource,
  getActiveDataSource,
} from './interface';

export { MockDataSource } from './mock';
export { AliyunDataSource };

export type { AliyunConfig } from './aliyun';

/**
 * 初始化数据源系统
 * 在应用启动时调用此函数
 * 
 * @example
 * ```typescript
 * // 在 main.tsx 中
 * import { initializeDataSources } from '@/services/datasource';
 * 
 * initializeDataSources({
 *   default: 'mock',  // 默认使用 Mock
 *   aliyun: {
 *     accessKeyId: import.meta.env.VITE_ALIYUN_AK,
 *     // ... 其他配置
 *   }
 * });
 * ```
 */
export interface DataSourceInitConfig {
  /** 默认数据源名称 */
  default?: 'mock' | 'aliyun' | string;
  
  /** 阿里云配置（可选） */
  aliyun?: {
    accessKeyId: string;
    accessKeySecret: string;
    project: string;
    slsLogstore: string;
    slsEndpoint?: string;
    timeout?: number;
  };
}

/**
 * 初始化数据源系统
 */
export function initializeDataSources(config?: DataSourceInitConfig): void {
  // 始终注册 Mock 数据源
  DataSourceFactory.register(MockDataSource.NAME, new MockDataSource());

  // 如果提供了阿里云配置，则注册阿里云数据源
  if (config?.aliyun) {
    try {
      const aliyunDS = new AliyunDataSource({
        accessKeyId: config.aliyun.accessKeyId,
        accessKeySecret: config.aliyun.accessKeySecret,
        project: config.aliyun.project,
        slsLogstore: config.aliyun.slsLogstore,
        slsEndpoint: config.aliyun.slsEndpoint,
        timeout: config.aliyun.timeout,
      });
      DataSourceFactory.register(AliyunDataSource.NAME, aliyunDS);
      console.log('✅ 阿里云数据源已注册');
    } catch (error) {
      console.error('❌ 阿里云数据源注册失败:', error);
    }
  }

  // 激活默认数据源
  const defaultSource = config?.default || 'mock';
  try {
    setActiveDataSource(defaultSource);
    console.log(`✅ 已激活数据源: ${defaultSource}`);
  } catch (error) {
    console.error(`❌ 无法激活数据源 ${defaultSource}:`, error);
    // 降级到 Mock
    setActiveDataSource('mock');
    console.log('⚠️  已降级到 Mock 数据源');
  }
}
