# 数据源抽象层文档

## 概述

该目录实现了一个**分层的数据源抽象系统**，使得应用可以无缝地在不同数据源（Mock、阿里云等）之间切换，而**无需修改任何 UI 代码**。

## 文件结构

```
datasource/
├── interface.ts       # 数据源标准接口和工厂类
├── mock.ts           # Mock 数据源实现
├── aliyun.ts         # 阿里云数据源实现（骨架）
└── README.md         # 本文件
```

## 核心概念

### 1. IDataSource 接口（interface.ts）

定义了所有数据源必须实现的统一接口：

```typescript
interface IDataSource {
  fetchMetrics(...): Promise<DailyMetric[]>;
  fetchComparison(...): Promise<ComparisonResult>;
  fetchFunnel(...): Promise<FunnelData>;
  fetchModuleOverview(...): Promise<Record<string, any>>;
  fetchModuleAverages(...): Promise<any>;
  fetchMetricsResponse(...): Promise<MetricsResponse>;
}
```

### 2. DataSourceFactory（工厂类）

用于管理和切换数据源实现：

```typescript
// 注册数据源
DataSourceFactory.register('mock', new MockDataSource());
DataSourceFactory.register('aliyun', new AliyunDataSource(config));

// 激活指定数据源
setActiveDataSource('mock');
setActiveDataSource('aliyun');

// 获取当前激活的数据源
const currentDS = getActiveDataSource();
```

### 3. API 适配器层（api.ts）

所有 API 调用都通过适配器层转发，确保数据源的透明切换：

```typescript
export async function fetchMetrics(...) {
  const metrics = await activeDataSource.fetchMetrics(...);
  return { code: 0, data: { ... } };
}
```

## 使用方式

### 默认配置（使用 Mock 数据源）

应用启动时已自动注册并激活了 Mock 数据源，无需额外配置：

```typescript
// 在 api.ts 中已自动初始化：
DataSourceFactory.register(MockDataSource.NAME, new MockDataSource());
let activeDataSource: IDataSource = new MockDataSource();
```

### 切换到阿里云（3 步）

#### 第一步：配置阿里云凭证

在 `.env` 或 `src/config.ts` 中添加：

```bash
VITE_ALIYUN_AK=your_access_key_id
VITE_ALIYUN_SK=your_access_key_secret
VITE_ALIYUN_PROJECT=your_project_name
VITE_ALIYUN_LOGSTORE=your_logstore_name
VITE_ALIYUN_ENDPOINT=cn-beijing.log.aliyuncs.com
```

#### 第二步：初始化阿里云数据源（在 main.tsx 或 App.tsx）

```typescript
import { DataSourceFactory, setDataSource } from './services/datasource/interface';
import { AliyunDataSource } from './services/datasource/aliyun';

// 在应用启动时执行
const aliyunDS = new AliyunDataSource({
  accessKeyId: import.meta.env.VITE_ALIYUN_AK,
  accessKeySecret: import.meta.env.VITE_ALIYUN_SK,
  project: import.meta.env.VITE_ALIYUN_PROJECT,
  slsLogstore: import.meta.env.VITE_ALIYUN_LOGSTORE,
  slsEndpoint: import.meta.env.VITE_ALIYUN_ENDPOINT,
  timeout: 30000,
});

DataSourceFactory.register('aliyun', aliyunDS);
setDataSource('aliyun');  // 切换到阿里云
```

#### 第三步：在 UI 中动态切换（可选）

如果需要在运行时切换数据源，可在页面中添加一个切换按钮：

```typescript
import { setDataSource } from '@/services/datasource/interface';

// 在设置或调试页面中
function switchDataSource(source: 'mock' | 'aliyun') {
  setDataSource(source);
  // 重新加载数据
  window.location.reload();
}
```

## 模块对接逻辑

### 四个 AI 模块的数据映射

#### 1. 拍单入库 (photo_inventory)

| 指标 | SLS 日志字段 | 聚合逻辑 |
|------|------------|---------|
| 开放门店数 | clinic_id (is_enabled=1) | count(distinct clinic_id) |
| 活跃门店数 | clinic_id (status=active) | count(distinct clinic_id) |
| 平均识别正确率 | recognition_score | avg(recognition_score) |
| 完成入库转化率 | event='done' / event='start' | count(done) / count(start) * 100 |

**示例 SQL：**

```sql
source = 'photo_inventory'
AND __time__ >= {startTime} AND __time__ <= {endTime}
|
stats
  count(distinct clinic_id, if(is_enabled=1, 1, null)) as open_clinic_count,
  count(distinct clinic_id, if(status='active', 1, null)) as active_clinic_count,
  avg(recognition_score) as avg_recognition_accuracy,
  count(if(event='done', 1, null)) * 100.0 / count(if(event='start', 1, null)) as completion_rate
by strftime(__time__, '%Y-%m-%d') as date
|
order by date
```

#### 2. AI诊疗 (ai_diagnosis)

| 指标 | SLS 日志字段 | 聚合逻辑 |
|------|------------|---------|
| 日使用诊所数 | clinic_id (module='diagnosis') | count(distinct clinic_id) |
| 日使用医生数 | doctor_id (module='diagnosis') | count(distinct doctor_id) |
| 采纳率 | is_adopted=1 / total | sum(is_adopted) / count() * 100 |
| Token消耗 | token_used | sum(token_used) |

**示例 SQL：**

```sql
source = 'ai_diagnosis'
AND __time__ >= {startTime} AND __time__ <= {endTime}
|
stats
  count(distinct clinic_id) as daily_clinics,
  count(distinct doctor_id) as daily_doctors,
  count(if(is_adopted=1, 1, null)) * 100.0 / count() as adoption_rate,
  sum(token_used) / 10000.0 as token_consumption
by strftime(__time__, '%Y-%m-%d') as date
|
order by date
```

#### 3. 语音病历 (voice_records)

| 指标 | SLS 日志字段 | 聚合逻辑 |
|------|------------|---------|
| 日使用诊所数 | clinic_id (module='voice') | count(distinct clinic_id) |
| 病历生成次数 | event='generated' | count() |
| 采纳次数 | is_adopted=1 | count(is_adopted=1) |
| Token消耗 | token_used | sum(token_used) |

#### 4. AI舌象 (ai_tongue)

类似于 AI诊疗，聚焦舌象识别的使用频次和采纳。

### 环比对比逻辑

**同比计算公式：**

```
期间1平均值 = SUM(指标, 时间1..时间1+N) / N
期间2平均值 = SUM(指标, 时间2..时间2+N) / N
变化 = 期间1平均值 - 期间2平均值
变化率 = (变化 / 期间2平均值) * 100%
趋势 = 变化 > 0 ? 'up' : 'down'
```

## 实现清单

### ✅ 已完成

- [x] IDataSource 接口定义
- [x] DataSourceFactory 工厂类
- [x] MockDataSource 完整实现
- [x] API 适配器层改造
- [x] 环境变量配置框架

### 📝 待实现（按优先级）

- [ ] **AliyunDataSource 核心实现**
  - [ ] SLS 连接和查询功能
  - [ ] 四个模块的 SQL 模板
  - [ ] 数据转换函数（SLS -> DailyMetric）
  - [ ] 错误处理和重试机制

- [ ] **性能优化**
  - [ ] 查询结果缓存（Redis）
  - [ ] 数据预聚合（DataWorks）
  - [ ] 批量查询接口

- [ ] **监控和调试**
  - [ ] 数据源切换日志
  - [ ] 查询性能指标
  - [ ] 错误上报

## 环境变量配置

创建 `.env.local` 文件（用于开发）：

```bash
# Mock 数据源（默认）
VITE_DATA_SOURCE=mock

# 阿里云配置（可选）
VITE_ALIYUN_AK=your_access_key
VITE_ALIYUN_SK=your_secret_key
VITE_ALIYUN_PROJECT=analysis-project
VITE_ALIYUN_LOGSTORE=ai-metrics
VITE_ALIYUN_ENDPOINT=cn-beijing.log.aliyuncs.com
```

## 常见问题

### Q: 如何验证数据源是否正确连接？

```typescript
import { getDataSource } from '@/services/datasource/interface';

const ds = getDataSource();
console.log('Current DataSource:', ds.constructor.name);

// 测试查询
const result = await ds.fetchMetrics('ai_diagnosis', startDate, endDate);
console.log('Test Result:', result);
```

### Q: 从 Mock 切换到阿里云后，数据格式应该保持一致吗？

**答：是的。** 所有数据源都必须返回相同的 `DailyMetric[]` 格式。不同的是数据的来源和计算方式，但接口的返回类型必须完全一致。

### Q: 如何处理 SLS 查询中的时区问题？

SLS 中的 `__time__` 是 Unix 时间戳（秒级），需要在构建 SQL 时转换：

```typescript
const startTime = Math.floor(startDate.getTime() / 1000);  // JS 毫秒 -> Unix 秒
const endTime = Math.floor(endDate.getTime() / 1000);
```

### Q: 阿里云实现需要额外的 npm 依赖吗？

建议安装官方 SDK：

```bash
npm install @alicloud/log
```

更新 aliyun.ts 中的导入：

```typescript
import SLS from '@alicloud/log';
```

## 下一步

1. **完善 AliyunDataSource**：根据您的日志结构填充 TODO 部分
2. **灰度测试**：在生产环境对比 Mock 和 Aliyun 的数据准确性
3. **性能优化**：考虑缓存和预聚合策略
4. **文档补充**：针对您的具体 SQL 和数据结构补充文档
