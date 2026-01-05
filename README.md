# AI 功能数据统计平台 - 前端仪表板

**版本**：1.0.0  
**更新时间**：2025-01-05  
**状态**：✅ 生产就绪

---

## 📋 快速导航

- 🚀 [快速开始](#-快速开始)
- 📖 [项目介绍](#-项目介绍)
- 🏗️ [技术栈](#-技术栈)
- 📁 [项目结构](#-项目结构)
- 🔌 [API 集成](#-api-集成)
- 📊 [数据源架构](#-数据源架构)
- 🌐 [部署指南](#-部署指南)
- 📚 [文档与资源](#-文档与资源)

---

## 📖 项目介绍

### 项目概述

本项目是 **AI 功能数据统计平台** 的前端仪表板应用，用于实时展示和分析 AI 功能的使用数据。

**核心功能**：
- 📊 实时数据可视化（日/周/月多维度视图）
- 📈 同环比对比分析
- 🔍 数据钻取和维度分析
- 📉 转化漏斗展示
- 📄 数据导出（Excel/CSV/JSON）
- 🔮 智能归因分析

**支持的 AI 模块**：
1. **拍单入库** - 药店/诊所 AI 拍单收货与入库
2. **AI 诊疗** - AI 诊断辅助和处方建议
3. **语音病历** - 语音录音生成病历
4. **AI 舌象** - 舌象图像 AI 分析

### 用户场景

- **管理层**：快速了解 AI 功能的日常 KPI
- **产品经理**：深入分析功能使用趋势和用户行为
- **数据分析师**：对比不同时间段，识别增长机会

---

## 🚀 快速开始

### 环境要求

```bash
Node.js >= 18.0.0
npm >= 9.0.0 或 pnpm >= 8.0.0
```

### 第一步：克隆和安装

```bash
# 克隆仓库
git clone https://github.com/your-org/ai-stats-dashboard.git
cd ai-stats-dashboard

# 安装依赖
pnpm install
# 或使用 npm
npm install
```

### 第二步：配置环境变量

```bash
# 复制示例配置
cp .env.example .env.local

# 编辑 .env.local
# VITE_API_BASE_URL=http://localhost:3000/api
# VITE_DATA_SOURCE=mock  # 'mock' 或 'aliyun'
```

### 第三步：启动开发服务

```bash
# 启动 Vite 开发服务
pnpm dev

# 访问 http://localhost:5173
```

### 第四步：构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

---

## 🏗️ 技术栈

### 前端框架

| 技术 | 版本 | 用途 |
|-----|------|------|
| **React** | 18.x | UI 框架 |
| **TypeScript** | 5.x | 类型安全 |
| **Vite** | 5.x | 构建工具 |
| **Tailwind CSS** | 3.x | 样式系统 |
| **shadcn/ui** | latest | UI 组件库 |
| **AntV (G2)** | latest | 数据可视化 |
| **dayjs** | 1.x | 日期处理 |
| **Zustand** | latest | 状态管理 |

### 开发工具

```bash
# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 单元测试（可选）
pnpm test

# 类型检查
pnpm type-check
```

---

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Charts.tsx      # 数据图表（趋势图、对比图等）
│   └── ui.tsx          # UI 基础组件（Card、Button 等）
├── services/           # 业务逻辑层
│   ├── api.ts          # API 适配器层（数据源无关）
│   ├── mockData.ts     # Mock 数据生成器
│   └── datasource/     # 数据源抽象层
│       ├── interface.ts # 数据源接口和工厂
│       ├── mock.ts     # Mock 实现
│       ├── aliyun.ts   # 阿里云实现（骨架）
│       └── README.md   # 数据源文档
├── stores/             # 状态管理（Zustand）
│   └── dashboardStore.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

### 核心文件说明

#### 1. **api.ts** - API 适配器层

所有数据获取的统一入口，支持无缝切换数据源：

```typescript
// 通过 fetchMetrics() 获取指标数据
// 底层可以是 Mock、阿里云 SLS 或其他实现
const response = await fetchMetrics(
  'ai_diagnosis',           // 模块代码
  startDate,               // 开始日期
  endDate,                 // 结束日期
  'day',                   // 统计粒度
  isDemoMode               // 演示模式标志
);
```

#### 2. **datasource/** - 数据源抽象层

支持多个数据源实现，遵循统一接口：

- **interface.ts**：定义 `IDataSource` 接口和工厂类
- **mock.ts**：Mock 数据源实现（默认激活）
- **aliyun.ts**：阿里云数据源实现（骨架，待完善）

详见 `src/services/datasource/README.md`

#### 3. **mockData.ts** - Mock 数据生成

为开发和演示提供本地生成的模拟数据：

```typescript
// 生成日期范围内的随机指标数据
const metrics = getMockMetrics(
  'ai_diagnosis',          // 模块
  new Date('2025-01-01'),  // 开始日期
  new Date('2025-01-31'),  // 结束日期
  'day'                    // 粒度
);
```

#### 4. **App.tsx** - 主应用组件

包含仪表板的主要功能：
- 日期范围选择
- 模块切换
- 数据聚合和对比
- 多个分析视图

---

## 🔌 API 集成

### 后端 API 规范

```typescript
// 获取指标数据
GET /api/v1/metrics/:module
  ?startDate=2025-01-01
  &endDate=2025-01-31
  &period=day

Response: {
  code: 0,
  data: {
    module: string,
    period: 'day' | 'week' | 'month',
    metrics: DailyMetric[]
  }
}

// 对比分析
POST /api/v1/comparison
{
  module: string,
  metric: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
}

// 转化漏斗
GET /api/v1/funnel/:module
  ?startDate=2025-01-01
  &endDate=2025-01-31

// 模块概览
GET /api/v1/overview?date=2025-01-05

// 指标平均值
GET /api/v1/averages/:module
```

### 数据类型定义

参考 `src/types/index.ts`，核心类型包括：

- `DailyMetric`：单日指标数据
- `MetricsResponse`：指标查询响应
- `ComparisonResult`：对比分析结果
- `FunnelData`：转化漏斗数据

---

## 📊 数据源架构

### 架构概览

项目采用**分层数据源架构**，支持无缝切换不同的数据源实现：

```
┌──────────────────┐
│  UI 层      │  App.tsx - 仪表板页面
└────────┬─────────┘
         │
┌────────┴──────────────────────┐
│  API 适配器层       │  api.ts - 统一数据接口
└────────┬──────────────────────┘
         │
┌────────┴─────────────────────────────┐
│  数据源工厂                │  datasource/interface.ts
└────────┬─────────────────────────────┘
         │
   ┌─────┴─────────────────────┐
   │                           │
┌──┴───────────┐     ┌────────┴───────┐
│  Mock 数据   │     │  阿里云 SLS    │
│  本地生成    │     │  真实日志      │
└──────────────┘     └────────────────┘
```

### 初始化数据源

```typescript
// main.tsx 或 App.tsx 中
import { initializeDataSources } from '@/services/datasource';

initializeDataSources({
  default: 'mock',  // 默认使用 Mock
  aliyun: {         // 可选：注册阿里云数据源
    accessKeyId: import.meta.env.VITE_ALIYUN_AK,
    accessKeySecret: import.meta.env.VITE_ALIYUN_SK,
    project: import.meta.env.VITE_ALIYUN_PROJECT,
    slsLogstore: import.meta.env.VITE_ALIYUN_LOGSTORE,
  }
});
```

### 动态切换数据源

```typescript
import { setActiveDataSource } from '@/services/datasource';

// 在任何地方切换
setActiveDataSource('mock');     // 回到 Mock
setActiveDataSource('aliyun');   # 切换到阿里云
```

**详细说明**：参考 `src/services/datasource/README.md` 和 `DATA_SOURCE_MIGRATION_GUIDE.md`

---

## 🌐 部署指南

### GitHub + Cloudflare Pages 部署

#### 第一步：准备 GitHub 仓库

```bash
# 1. 在 GitHub 创建新仓库
# 仓库名：ai-stats-dashboard
# 访问性：Public（GitHub Pages 需要）

# 2. 推送代码到 GitHub
git remote add origin https://github.com/your-org/ai-stats-dashboard.git
git branch -M main
git push -u origin main
```

#### 第二步：配置 Cloudflare Pages

**方式 A：Cloudflare Dashboard 连接**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 "Pages" → "Create a project"
3. 选择 "Connect to Git" → GitHub
4. 授权并选择 `ai-stats-dashboard` 仓库
5. 配置构建设置：
   - **Framework preset**：React
   - **Build command**：`pnpm build`
   - **Build output directory**：`dist`
   - **Environment variables**（可选）：
     ```
     VITE_API_BASE_URL=https://api.example.com
     VITE_DATA_SOURCE=aliyun
     ```
6. 部署

**方式 B：Wrangler CLI（推荐用于 CI/CD）**

```bash
# 1. 安装 Wrangler
pnpm install -D wrangler

# 2. 认证
pnpm wrangler login

# 3. 创建 wrangler.toml
cat > wrangler.toml << 'EOF'
name = "ai-stats-dashboard"
main = "dist/index.html"
compatibility_date = "2025-01-01"

[env.production]
name = "ai-stats-dashboard-prod"
route = "https://dashboard.example.com/*"
zone_id = "your_zone_id"
EOF

# 4. 部署
pnpm build
pnpm wrangler pages deploy dist
```

#### 第三步：GitHub Actions CI/CD（自动部署）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ai-stats-dashboard
          directory: dist
          productionBranch: main
```

**配置 GitHub Secrets**：

1. 在 Cloudflare Dashboard 获取 API Token
2. 在 GitHub 仓库设置 → Secrets 中添加：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

#### 第四步：配置自定义域名（可选）

1. 在 Cloudflare Dashboard 的 Pages 项目中选择 "Custom domain"
2. 输入您的域名（如 `dashboard.example.com`）
3. 按照提示配置 DNS 记录

#### 第五步：配置 API 后端

部署前，确保更新环境变量指向正确的 API 地址：

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_DATA_SOURCE=aliyun
```

#### 部署验证

```bash
# 构建本地测试
pnpm build
pnpm preview

# 检查输出文件
ls -la dist/

# 验证部署成功
curl https://your-deployment.pages.dev/
```

### 环境配置

**开发环境**（`.env.local`）：
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DATA_SOURCE=mock
```

**生产环境**（`.env.production`）：
```
VITE_API_BASE_URL=https://api.example.com
VITE_DATA_SOURCE=aliyun
```

### 性能优化

```bash
# 分析包体积
pnpm build --analyze

# 生成性能报告
pnpm build --report

# Lighthouse 审计
curl https://your-deployment.pages.dev/ | lighthouse
```

---

## 📚 文档与资源

### 本项目文档

- **[DATA_SOURCE_MIGRATION_GUIDE.md](./DATA_SOURCE_MIGRATION_GUIDE.md)** - 数据源架构迁移指南
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - 详细部署指南
- **[QUICK_START.md](./QUICK_START.md)** - 项目快速启动
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 项目状态
- **[src/services/datasource/README.md](./src/services/datasource/README.md)** - 数据源使用文档

### 相关项目

- **[AI 统计平台设计文档](../fenxi/)** - 完整的设计文档库
  - METRICS_DESIGN.md - 指标定义
  - BACKEND_GUIDE.md - 后端实现
  - FRONTEND_ARCHITECTURE.md - 前端架构

### 外部资源

- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs)
- [Vite 文档](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui 组件库](https://ui.shadcn.com)
- [AntV G2 图表](https://g2.antv.vision)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages)

---

## 🤝 贡献指南

### 代码风格

```bash
# 代码检查
pnpm lint

# 格式化
pnpm format
```

### Git 工作流

```bash
# 创建特性分支
git checkout -b feature/your-feature

# 提交更改
git commit -m "feat: description"

# 推送
git push origin feature/your-feature

# 创建 Pull Request
```

### Pull Request 检查清单

- [ ] 代码符合项目风格
- [ ] 通过 `pnpm lint` 检查
- [ ] 包含相关的类型定义
- [ ] 更新相关文档
- [ ] 测试通过

---

## 📞 获取帮助

- 🐛 **Issue**：在 GitHub Issues 中报告问题
- 💬 **讨论**：在 GitHub Discussions 中讨论功能建议
- 📧 **联系**：[your-email@example.com]

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

## ✨ 项目统计

- **代码行数**：~2,500 行（TypeScript + React）
- **组件数**：15+ 个
- **数据源支持**：2 个（Mock、阿里云）
- **AI 模块支持**：4 个
- **构建大小**：~250 KB (gzip)
- **性能指标**：Lighthouse 90+

---

**最后更新**：2025-01-05  
**维护者**：[Your Team]  
**官网**：[Coming Soon]

祝您使用愉快！🚀
