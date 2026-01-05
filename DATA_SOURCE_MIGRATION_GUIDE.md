# 数据源架构迁移指南

## 🎯 本阶段工作总结

您已成功完成了**从 Mock 数据到阿里云数据源的分层架构搭建**。该架构支持：

- ✅ **无缝数据源切换** - 无需修改任何 UI 代码
- ✅ **工厂模式管理** - 支持多个数据源并存注册
- ✅ **类型安全** - 完整的 TypeScript 类型定义
- ✅ **易于扩展** - 添加新数据源只需实现一个接口
- ✅ **开箱即用** - Mock 数据源默认已注册激活

---

## 📁 新增文件结构

```
src/services/datasource/
├── interface.ts         # 标准接口 + 工厂类
│   ├── IDataSource      # 数据源统一接口
│   ├── DataSourceFactory # 工厂类（注册、管理、获取）
│   └── setActiveDataSource() # 切换数据源函数
│
├── mock.ts              # Mock 数据源实现 ✅（完整）
│   └── MockDataSource   # 实现 IDataSource，基于 mockData.ts
│
├── aliyun.ts            # 阿里云数据源实现 📝（骨架）
│   └── AliyunDataSource # 实现 IDataSource，集成 SLS/DataWorks
│
├── index.ts             # 导出 + 初始化函数
│   └── initializeDataSources() # 一键初始化所有数据源
│
└── README.md            # 详细文档 📖（包含 SQL 模板）
```

---

## 🔄 数据流变化

### 之前（紧耦合）
```
UI 层 → API 服务 → MockData 直接调用
```

### 现在（解耦）
```
UI 层 
  ↓
API 服务（api.ts - 适配器）
  ├─ 调用 activeDataSource.fetchMetrics()
  ├─ 调用 activeDataSource.fetchFunnel()
  └─ 调用 activeDataSource.fetchComparison()
  ↓
数据源工厂
  ├─ Mock 数据源 ✅（默认）
  ├─ 阿里云数据源 📝（待实现）
  └─ 其他自定义数据源 🔮（可扩展）
```

---

## ⚙️ 使用方式

### 第一步：在应用启动时初始化

**在 `main.tsx` 或 `App.tsx` 顶部添加：**

```typescript
import { initializeDataSources } from '@/services/datasource';

// 选项 1：仅使用 Mock（无需任何配置）
initializeDataSources({ default: 'mock' });

// 选项 2：同时注册 Mock 和阿里云
initializeDataSources({
  default: 'mock',  // 启动时使用 Mock
  aliyun: {
    accessKeyId: import.meta.env.VITE_ALIYUN_AK,
    accessKeySecret: import.meta.env.VITE_ALIYUN_SK,
    project: import.meta.env.VITE_ALIYUN_PROJECT,
    slsLogstore: import.meta.env.VITE_ALIYUN_LOGSTORE,
    slsEndpoint: import.meta.env.VITE_ALIYUN_ENDPOINT,
  }
});

// 注册完成后，所有 fetchMetrics()、fetchFunnel() 等调用
// 会自动使用激活的数据源 ✨
```

### 第二步：动态切换数据源（可选）

```typescript
import { setActiveDataSource } from '@/services/datasource';

// 在任何地方切换
setActiveDataSource('mock');     // 回到 Mock
setActiveDataSource('aliyun');   // 切换到阿里云

// 切换后，后续的所有 API 调用都会使用新的数据源
// 无需重新启动应用！
```

---

## 🚀 下一步：实现阿里云数据源

### 任务清单

#### 1️⃣ 安装阿里云 SDK
```bash
npm install @alicloud/log
```

#### 2️⃣ 完善阿里云配置（.env.local）
```bash
VITE_ALIYUN_AK=your_access_key_id
VITE_ALIYUN_SK=your_access_key_secret
VITE_ALIYUN_PROJECT=your_project_name
VITE_ALIYUN_LOGSTORE=your_logstore_name
VITE_ALIYUN_ENDPOINT=cn-beijing.log.aliyuncs.com
```

#### 3️⃣ 实现 `AliyunDataSource` 中的 TODO 部分

**在 `aliyun.ts` 中需要实现：**

1. **`querySLS()`** - 执行 SLS SQL 查询
   ```typescript
   private async querySLS(sqlQuery: string): Promise<SLSQueryResult> {
     // TODO: 使用 @alicloud/log SDK 执行查询
     // 参考 README.md 中的 SQL 模板
   }
   ```

2. **`buildMetricsQuery()`** - 为每个模块构建 SQL
   ```typescript
   // 示例 SQL（拍单入库）：
   source = 'photo_inventory'
   AND __time__ >= {startTime} AND __time__ <= {endTime}
   |
   stats
     count(distinct clinic_id) as active_count,
     avg(recognition_score) as avg_accuracy
   by strftime(__time__, '%Y-%m-%d') as date
   ```

3. **`transformToMetrics()`** - 将 SLS 结果转换为 DailyMetric
   ```typescript
   // 从 SLS 返回的 { date, active_count, avg_accuracy, ... }
   // 转换为 DailyMetric[] 格式
   ```

#### 4️⃣ 针对四个模块的数据映射

详见 `src/services/datasource/README.md` 中的"模块对接逻辑"部分。

---

## 🔗 关键接口签名

所有数据源都必须实现这个接口：

```typescript
interface IDataSource {
  // 获取指标数据
  fetchMetrics(
    moduleCode: string,           // 'photo_inventory' | 'ai_diagnosis' | ...
    startDate: Date,              // 开始日期
    endDate: Date,                // 结束日期
    period?: 'day' | 'week' | 'month', // 聚合粒度
    useStatic?: boolean           // 演示模式标志
  ): Promise<DailyMetric[]>;

  // 获取对比分析
  fetchComparison(
    moduleCode: string,
    metricName: string,
    period1Start: Date,
    period1End: Date,
    period2Start: Date,
    period2End: Date
  ): Promise<ComparisonResult>;

  // 获取转化漏斗
  fetchFunnel(
    moduleCode: string,
    startDate?: Date
  ): Promise<FunnelData>;

  // ... 其他方法
}
```

---

## ✅ 验证清单

在对接阿里云之前，请确保：

- [ ] 阿里云 SLS 已有日志数据
- [ ] 日志中包含所需的字段（module/source、event、recognition_score 等）
- [ ] 已申请并获得阿里云 Access Key
- [ ] 可以通过 SLS 控制台手动执行你的 SQL 查询并获得结果
- [ ] 理解了"日、周、月"粒度对聚合逻辑的影响

---

## 🎓 设计模式解析

### 1. 适配器模式（Adapter Pattern）

**目的**：统一不同数据源的接口

```
[UI 层] ← API 适配器（api.ts）← [多个数据源实现]
```

**优势**：
- UI 永远只调用统一的 `fetchMetrics()`
- 后端实现可以任意切换
- 新增数据源无需改动 UI 代码

### 2. 工厂模式（Factory Pattern）

**目的**：集中管理数据源实例

```typescript
DataSourceFactory.register('mock', new MockDataSource());
DataSourceFactory.register('aliyun', new AliyunDataSource(...));

// 激活一个
setActiveDataSource('aliyun');
```

**优势**：
- 解耦实例创建与使用
- 支持运行时动态切换
- 便于测试（可以注入 Mock 数据源）

### 3. 策略模式（Strategy Pattern）

**目的**：同一个操作有多种实现策略

```typescript
// 同一个接口方法 fetchMetrics()
// 但可以有多个实现策略：
// - MockDataSource: 生成随机数据
// - AliyunDataSource: 查询日志
// - DatabaseDataSource: 查询数据库
```

---

## 📊 性能建议

### 短期（已实现）
- ✅ 根据日期范围自适应粒度（日/周/月）
- ✅ 缓存 Mock 数据生成结果

### 中期（推荐）
- 📝 在 `aliyun.ts` 中添加查询结果缓存
- 📝 使用 DataWorks 预聚合数据（而不是实时 SLS 查询）
- 📝 实现批量查询接口（一次查多个指标）

### 长期（可选）
- 🔮 集成 Redis 做分布式缓存
- 🔮 使用 Stream 处理大数据量
- 🔮 实现增量更新机制

---

## ❓ 常见问题

### Q: 如何测试新的数据源实现？

```typescript
// 创建一个测试数据源
class TestDataSource implements IDataSource {
  async fetchMetrics(...) {
    return [
      { moduleCode: 'test', metricName: 'test_metric', metricDate: '2025-01-01', metricValue: 100, ... }
    ];
  }
  // ... 其他方法
}

// 在单元测试中使用
DataSourceFactory.register('test', new TestDataSource());
setActiveDataSource('test');
```

### Q: 阿里云 SLS 日志的时间戳格式是什么？

SLS 中的 `__time__` 是 **Unix 时间戳（秒级）**，需要转换：

```typescript
// JavaScript 毫秒 → Unix 秒
const startTime = Math.floor(startDate.getTime() / 1000);

// 在 SQL 中使用
`__time__ >= ${startTime} AND __time__ <= ${endTime}`
```

### Q: 如何处理日期范围与粒度不匹配的情况？

当用户选择"周粒度"但只选了 2 天时？

**解决方案**（已实现）：在 `App.tsx` 中有自动粒度调整逻辑

```typescript
// 根据日期跨度自动调整
if (days > 90 && viewMode !== 'month') {
  setViewMode('month');  // 自动切换到月
} else if (days > 31 && viewMode === 'day') {
  setViewMode('week');   // 自动切换到周
}
```

---

## 📞 技术支持

如有疑问，请参考：

1. **`src/services/datasource/README.md`** - 详细的数据映射表和 SQL 示例
2. **`src/services/api.ts`** - API 适配层实现
3. **`src/services/mockData.ts`** - Mock 数据生成逻辑（参考）

---

**⚡ 快速开始**：只需在 `main.tsx` 中调用一行初始化代码，系统就能自动工作！
