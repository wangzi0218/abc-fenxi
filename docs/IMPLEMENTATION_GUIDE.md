# AI 数据统计平台 - Mock 前端实现指南

## 项目现状

我们已经完成了以下工作：

### ✅ 已完成
1. **类型定义** (`src/types/index.ts`)
   - 数据模型定义
   - API 响应类型
   - 4 个主要模块的指标定义

2. **Mock 数据服务** (`src/services/mockData.ts`)
   - 随机数据生成器
   - 支持日期范围查询
   - 支持跨期对比数据生成
   - 转化漏斗数据生成

3. **状态管理** (`src/stores/dashboardStore.ts`)
   - Dashboard 全局状态
   - 对比分析状态
   - 导出功能状态

### ⏳ 下一步工作

1. **安装所有依赖**
2. **创建 UI 组件库**
3. **实现页面和路由**
4. **完整的前端功能**

---

## 快速启动

### Step 1: 安装依赖

```bash
cd /Users/wangzi/Documents/sourcetree/abcpc/fenxi-dashboard

# 使用 npm 安装
npm install

# 或使用 pnpm（更快）
pnpm install

# 或使用 yarn
yarn install
```

### Step 2: 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173`

### Step 3: 构建生产版本

```bash
npm run build
```

---

## 项目架构

```
fenxi-dashboard/
├── src/
│   ├── components/          # UI 组件库（待创建）
│   │   ├── common/         # 通用组件
│   │   ├── dashboard/      # 仪表板组件
│   │   └── charts/         # 图表组件
│   ├── pages/              # 页面（待创建）
│   │   ├── Dashboard.tsx
│   │   ├── Comparison.tsx
│   │   └── Export.tsx
│   ├── hooks/              # 自定义 Hook（待创建）
│   ├── services/           # 服务层
│   │   ├── mockData.ts     # ✅ Mock 数据服务
│   │   └── api.ts          # 待创建
│   ├── stores/             # 全局状态（Zustand）
│   │   └── dashboardStore.ts # ✅ 状态管理
│   ├── types/              # TypeScript 类型
│   │   └── index.ts        # ✅ 类型定义
│   ├── utils/              # 工具函数（待创建）
│   ├── App.tsx             # 主应用（待创建）
│   └── main.tsx            # 入口（待创建）
├── package.json            # ✅ 已更新依赖
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript 配置
```

---

## 核心依赖说明

| 依赖 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI 框架 |
| React Router | 6.20.0 | 路由管理 |
| Zustand | 4.4.0 | 状态管理 |
| Axios | 1.6.0 | HTTP 请求 |
| dayjs | 1.11.0 | 日期处理 |
| Recharts | 2.10.0 | 图表库 |
| AntV G2 | 5.0.0 | 高级图表 |
| AntV S2 | 2.0.0 | 数据表格 |
| Tailwind CSS | 3.3.0 | CSS 框架 |
| Lucide React | 0.408.0 | 图标库 |

---

## 开发流程

### 1. 安装依赖后，你会看到的问题

当前代码中有一些 TypeScript 错误提示，这是正常的，因为：
- 依赖还没有安装
- Node modules 目录为空

运行 `npm install` 后，这些错误会自动解决。

### 2. 接下来要实现的组件

按优先级顺序：

#### 基础组件 (src/components/common/)
- Layout.tsx - 整体布局框架
- Header.tsx - 顶部导航栏
- Sidebar.tsx - 左侧菜单
- Card.tsx - 卡片组件
- Button.tsx - 按钮组件
- Loading.tsx - 加载态

#### 指标组件 (src/components/)
- MetricCard.tsx - 指标卡片（显示数值、环比、图表小图）
- TrendChart.tsx - 趋势图表（使用 Recharts）
- BarChart.tsx - 柱状图
- FunnelChart.tsx - 转化漏斗
- ComparisonChart.tsx - 对比图表
- DataTable.tsx - 数据表格（使用 AntV S2）

#### 页面 (src/pages/)
- Dashboard.tsx - 仪表板首页（日/周/月视图）
- ModuleDetail.tsx - 模块详情页
- Comparison.tsx - 对比分析页
- Export.tsx - 数据导出页

#### 自定义 Hook (src/hooks/)
- useMetrics.ts - 获取指标数据
- useComparison.ts - 对比分析逻辑
- useFunnel.ts - 转化漏斗数据

#### 工具函数 (src/utils/)
- format.ts - 格式化工具（数字、百分比、日期）
- calculate.ts - 计算工具（环比、同比、增长率）
- constants.ts - 常量定义

### 3. 实现顺序建议

```
安装依赖
  ↓
创建基础布局组件
  ↓
创建指标显示组件
  ↓
创建图表组件
  ↓
实现仪表板页面
  ↓
实现其他功能页面
  ↓
集成路由和状态管理
  ↓
样式优化和性能调整
```

---

## 使用 Mock 数据的示例

### 在组件中使用 Mock 数据

```typescript
// 示例：在 React 组件中使用 Mock 数据

import { useDashboardStore } from '../stores/dashboardStore';
import { getMockMetrics } from '../services/mockData';

function MyComponent() {
  const { selectedModule, dateRange } = useDashboardStore();
  
  // 获取 Mock 数据
  const metrics = getMockMetrics(
    selectedModule,
    dateRange.startDate,
    dateRange.endDate,
    'day'
  );
  
  return (
    <div>
      {metrics.map(metric => (
        <div key={`${metric.metricName}-${metric.metricDate}`}>
          {metric.metricName}: {metric.metricValue}
        </div>
      ))}
    </div>
  );
}
```

### 使用 SWR 包装 Mock 数据（推荐）

```typescript
// src/hooks/useMetrics.ts

import useSWR from 'swr';
import { getMockMetrics } from '../services/mockData';

export function useMetrics(
  module: string,
  startDate: Date,
  endDate: Date,
  period: 'day' | 'week' | 'month' = 'day'
) {
  const { data, error, isLoading } = useSWR(
    [`metrics`, module, startDate, endDate, period],
    () => getMockMetrics(module, startDate, endDate, period),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 分钟内不重复请求
    }
  );

  return {
    metrics: data || [],
    isLoading,
    error,
  };
}
```

---

## 数据流程

```
User 交互 (选择模块、日期等)
  ↓
更新 Zustand Store
  ↓
组件读取 Store 更新
  ↓
调用 Mock 数据服务
  ↓
生成随机但逼真的数据
  ↓
通过 SWR 缓存
  ↓
更新 UI 展示
```

---

## 接下来的任务列表

1. **安装依赖**
   ```bash
   npm install
   ```

2. **创建基础组件** (src/components/)
   - Layout.tsx - 整体框架
   - Header.tsx - 顶部导航
   - Card.tsx - 卡片

3. **创建指标组件**
   - MetricCard.tsx - 指标卡片

4. **创建首页仪表板** (src/pages/)
   - Dashboard.tsx

5. **配置路由和主应用**
   - App.tsx
   - main.tsx

6. **样式和主题**
   - 配置 Tailwind CSS
   - 创建主题文件

7. **优化和微调**
   - 性能优化
   - 响应式设计
   - 深色模式支持

---

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint

# 项目目录结构
ls -R src/
```

---

## 常见问题

### Q: 为什么提示找不到模块？
A: 需要运行 `npm install` 安装所有依赖。

### Q: Mock 数据会重复吗？
A: 不会。每次请求都会生成新的随机数据，模拟真实数据变化。

### Q: 如何自定义 Mock 数据？
A: 编辑 `src/services/mockData.ts` 中的生成函数，如 `getRandomInt()` 等。

### Q: 如何切换到真实后端 API？
A: 
1. 创建 `src/services/api.ts`
2. 使用 `axios` 实例调用真实 API
3. 在 Hook 中替换 Mock 数据调用即可

---

## 下一步

1. **运行项目**
   ```bash
   cd /Users/wangzi/Documents/sourcetree/abcpc/fenxi-dashboard
   npm install
   npm run dev
   ```

2. **查看项目结构**
   ```bash
   ls -la src/
   ```

3. **开始实现组件**
   - 从基础 Layout 开始
   - 逐步添加功能

---

**项目状态**: 已完成基础架构，Ready for Component Development! 🚀
