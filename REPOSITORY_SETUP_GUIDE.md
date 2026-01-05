# 独立仓库设置指南

本文档指导您将 `fenxi-dashboard` 设置为一个独立的 GitHub 仓库，并通过 Cloudflare Pages 部署。

---

## 📋 目录

1. [仓库初始化](#仓库初始化)
2. [GitHub 配置](#github-配置)
3. [Cloudflare Pages 部署](#cloudflare-pages-部署)
4. [CI/CD 配置](#cicd-配置)
5. [文档准备](#文档准备)

---

## 仓库初始化

### 第一步：本地初始化

如果还未初始化 Git 仓库：

```bash
# 进入项目目录
cd fenxi-dashboard

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "chore: initial commit - AI stats dashboard frontend"

# 查看提交历史
git log --oneline -5
```

### 第二步：连接远程仓库

```bash
# 添加远程仓库（替换为您的 GitHub URL）
git remote add origin https://github.com/YOUR_ORG/ai-stats-dashboard.git

# 重命名分支为 main（如需要）
git branch -M main

# 推送到远程仓库
git push -u origin main

# 验证远程连接
git remote -v
```

---

## GitHub 配置

### 第一步：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `ai-stats-dashboard`
   - **Description**: `AI 功能数据统计平台 - 前端仪表板`
   - **Visibility**: Public（GitHub Pages 必需）
   - **Initialize**: 不选择任何初始化选项（我们已有代码）
3. 点击 "Create repository"

### 第二步：GitHub Pages 设置（可选）

如果需要通过 GitHub Pages 部署：

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 建立工作流文件（见后续 CI/CD 配置）

### 第三步：分支保护规则

建议配置 `main` 分支保护：

1. Settings → Branches
2. 点击 "Add rule"
3. 输入分支名称 `main`
4. 启用：
   - "Require a pull request before merging"
   - "Require status checks to pass before merging"
   - "Require branches to be up to date before merging"

---

## Cloudflare Pages 部署

### 第一步：关联 Cloudflare 账户

#### 方式 A：通过 Cloudflare Dashboard

1. 登录 [Cloudflare](https://dash.cloudflare.com)
2. 左侧菜单：Workers & Pages → Pages
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权 GitHub（首次需要授权）
6. 选择仓库：`your-org/ai-stats-dashboard`
7. 配置构建设置（见下方）

#### 方式 B：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -D wrangler

# 登录 Cloudflare
npx wrangler login

# 创建 Cloudflare Pages 项目
npx wrangler pages project create ai-stats-dashboard
```

### 第二步：配置构建设置

在 Cloudflare Pages 中配置：

| 设置项 | 值 |
|--------|-----|
| **Framework preset** | React |
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Environment variables** | 见下表 |

**环境变量**：

```
VITE_API_BASE_URL=https://api.example.com
VITE_DATA_SOURCE=aliyun
```

### 第三步：配置自定义域名（可选）

1. 在 Pages 项目中选择 "Custom domains"
2. 点击 "Setup custom domain"
3. 输入域名（如 `dashboard.example.com`）
4. 按照 DNS 配置提示完成

---

## CI/CD 配置

### GitHub Actions 工作流

工作流文件已存在于 `.github/workflows/deploy.yml`

主要步骤：

```yaml
1. Checkout 代码
2. Setup Node.js 18
3. Install pnpm
4. Install dependencies
5. Lint 检查
6. Type check
7. Build
8. Deploy to Cloudflare Pages
```

### 环境变量和 Secrets

#### GitHub Secrets 配置

1. Settings → Secrets and variables → Actions
2. 添加以下 Secrets：

```
CLOUDFLARE_API_TOKEN     = [您的 API Token]
CLOUDFLARE_ACCOUNT_ID    = [您的 Account ID]
VITE_API_BASE_URL        = https://api.example.com (可选)
VITE_DATA_SOURCE         = aliyun (可选)
```

#### 获取 Cloudflare 凭证

```bash
# 1. 访问 Cloudflare Dashboard
# My Account → API Tokens

# 2. 创建 Token（或复制现有的）
# - 复制 API Token

# 3. 获取 Account ID
# Cloudflare Dashboard 首页右侧的 Account ID

# 4. 保存到 GitHub Secrets
```

### 自动部署流程

```
git push origin main
     ↓
GitHub Actions 触发
     ↓
代码检查 + 构建
     ↓
Cloudflare Pages 自动部署
     ↓
✅ 部署完成 (https://ai-stats-dashboard.pages.dev)
```

---

## 文档准备

### 必需文档

项目中已准备的文档：

- ✅ **README.md** - 项目介绍和快速开始
- ✅ **.env.example** - 环境变量示例
- ✅ **DATA_SOURCE_MIGRATION_GUIDE.md** - 数据源架构说明
- ✅ **GITHUB_DEPLOYMENT_CHECKLIST.md** - 部署清单
- ✅ **.github/workflows/deploy.yml** - GitHub Actions 工作流

### 文档检查清单

- [ ] README.md 已更新（项目描述、快速开始）
- [ ] .env.example 包含所有必需的环境变量
- [ ] GITHUB_DEPLOYMENT_CHECKLIST.md 已完成
- [ ] LICENSE 文件存在（MIT License）
- [ ] CONTRIBUTING.md 已准备（可选）

### 可选补充文档

```markdown
# CONTRIBUTING.md
- 贡献指南
- Pull Request 流程
- 代码风格

# SECURITY.md
- 安全问题报告流程
- 已知问题说明

# CHANGELOG.md
- 版本更新历史
```

---

## 🚀 部署流程总结

### 快速部署

```bash
# 1. 确保代码已提交
git status

# 2. 推送到 main 分支
git push origin main

# 3. 自动触发 GitHub Actions
# （查看 Actions 标签，观察部署进度）

# 4. 等待 Cloudflare Pages 部署完成
# （通常 2-5 分钟）

# 5. 访问部署地址
# https://ai-stats-dashboard.pages.dev
```

### 部署验证

```bash
# 1. 检查构建日志
# GitHub: Actions → 最新工作流运行
# Cloudflare: Pages → 最新部署 → Build log

# 2. 访问应用
curl https://ai-stats-dashboard.pages.dev

# 3. 检查核心功能
# - 页面加载
# - 模块切换
# - API 请求
```

---

## 📊 仓库结构清单

部署前，确保仓库包含以下文件：

```
ai-stats-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # GitHub Actions 工作流
├── src/
│   ├── components/
│   ├── services/
│   │   └── datasource/
│   │       ├── interface.ts
│   │       ├── mock.ts
│   │       ├── aliyun.ts
│   │       └── README.md
│   ├── types/
│   ├── stores/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example                         # 环境变量示例
├── .gitignore                           # Git 忽略文件
├── README.md                            # 项目说明
├── GITHUB_DEPLOYMENT_CHECKLIST.md       # 部署清单
├── DATA_SOURCE_MIGRATION_GUIDE.md       # 数据源指南
├── package.json                         # 项目配置
├── package-lock.json                    # 依赖锁定
├── tsconfig.json                        # TypeScript 配置
├── vite.config.ts                       # Vite 配置
├── tailwind.config.js                   # Tailwind 配置
└── eslint.config.js                     # ESLint 配置
```

---

## 🔐 安全建议

### 敏感信息管理

- ✅ **不要提交** `.env.local` 或包含密钥的文件
- ✅ **使用 GitHub Secrets** 存储敏感信息
- ✅ **定期轮换** API Token 和密钥
- ✅ **使用只读 Token** 进行只读操作

### 代码安全

- ✅ **启用分支保护** 防止直接推送到 main
- ✅ **要求 Pull Request** 和代码审查
- ✅ **启用 CODEOWNERS** 指定代码所有者
- ✅ **定期更新** 依赖和安全补丁

---

## 📈 性能优化

### 构建优化

```bash
# 分析包体积
pnpm build --analyze

# 生成详细构建报告
pnpm build --report

# 检查构建输出大小
ls -lh dist/
```

### 部署优化

```
Cloudflare 自动优化：
- 全局 CDN 分发
- 自动缩小化和压缩
- 浏览器缓存（可自定义）
- 自动 HTTP/2 和 HTTP/3
```

### 监控和指标

在 Cloudflare Dashboard 查看：
- 请求数和带宽使用
- 缓存命中率
- 性能指标
- 错误率

---

## 🎯 后续步骤

### 上线前检查清单

- [ ] README.md 已完成并检查无误
- [ ] 所有 Secrets 已在 GitHub 配置
- [ ] GitHub Actions 工作流已测试
- [ ] Cloudflare Pages 部署成功
- [ ] 自定义域名已配置（可选）
- [ ] SSL/TLS 证书已应用（Cloudflare 自动）
- [ ] API 后端已配置和测试
- [ ] 性能指标已检查
- [ ] 错误日志已审查

### 持续维护

- [ ] 定期检查 GitHub Actions 运行状态
- [ ] 监控 Cloudflare Pages 部署日志
- [ ] 定期更新依赖（`pnpm update`）
- [ ] 定期审查和轮换密钥
- [ ] 收集和分析用户反馈

---

## 📞 获取帮助

- 📖 **GitHub Issues**: 报告问题
- 💬 **GitHub Discussions**: 讨论功能
- 📚 **项目文档**: README.md, DATA_SOURCE_MIGRATION_GUIDE.md
- 🌐 **Cloudflare 文档**: https://developers.cloudflare.com/pages

---

**最后更新**：2025-01-05  
**适用于**：fenxi-dashboard v1.0.0+

祝部署顺利！🚀
