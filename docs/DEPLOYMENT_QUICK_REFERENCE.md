# 部署快速参考指南

一份简明的部署清单，快速完成 GitHub + Cloudflare Pages 部署。

---

## 🚀 5 分钟快速部署

### 第一步：创建 GitHub 仓库

```bash
# 1. GitHub 上创建新仓库
# 访问 https://github.com/new
# 名称：ai-stats-dashboard
# 访问性：Public

# 2. 本地推送代码
git remote add origin https://github.com/YOUR_USERNAME/ai-stats-dashboard.git
git branch -M main
git push -u origin main
```

### 第二步：配置 Cloudflare

```bash
# 1. 获取凭证
# - Cloudflare Account ID：Dashboard 首页右侧
# - API Token：My Account → API Tokens → Create Token

# 2. 在 GitHub 添加 Secrets
# Settings → Secrets → Actions
# - CLOUDFLARE_ACCOUNT_ID = [您的 Account ID]
# - CLOUDFLARE_API_TOKEN = [您的 API Token]
```

### 第三步：部署到 Cloudflare Pages

```bash
# 选项 A：Cloudflare Dashboard
# 1. 访问 https://dash.cloudflare.com
# 2. Pages → Create a project → Connect to Git
# 3. 选择仓库，配置构建设置
#    - Build command: pnpm build
#    - Output directory: dist

# 选项 B：自动 (GitHub Actions)
# 1. 推送代码到 main
# 2. GitHub Actions 自动触发
# 3. 等待部署完成（~2-5分钟）
# 4. 访问 https://ai-stats-dashboard.pages.dev
```

---

## 📋 完整清单

### 准备阶段

- [ ] 代码已提交本地 Git 仓库
- [ ] `.env.local` 已配置（开发环境）
- [ ] `pnpm build` 能成功构建
- [ ] 项目编译无错误（✅ 已验证）

### GitHub 配置

- [ ] 创建了 GitHub 仓库
- [ ] 本地代码已推送到 GitHub
- [ ] 仓库设置为 Public（GitHub Pages 必需）
- [ ] 默认分支设置为 `main`

### Cloudflare 配置

- [ ] Cloudflare 账户已创建
- [ ] Account ID 已复制
- [ ] API Token 已生成
- [ ] GitHub Secrets 已配置

### 部署验证

- [ ] GitHub Actions 工作流成功运行
- [ ] Cloudflare Pages 部署成功
- [ ] 应用访问地址可用：https://ai-stats-dashboard.pages.dev
- [ ] 核心功能正常（页面加载、模块切换、数据显示）

### 可选配置

- [ ] 配置自定义域名
- [ ] 设置 SSL/TLS 证书（Cloudflare 自动）
- [ ] 配置环境变量（VITE_API_BASE_URL 等）
- [ ] 启用分支保护规则

---

## 🔑 关键 Secrets

在 GitHub 中配置以下 Secrets：

```
CLOUDFLARE_API_TOKEN       = cfp_xxxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID      = xxxxxxxxxxxxxxxx
VITE_API_BASE_URL          = https://api.example.com (可选)
VITE_DATA_SOURCE           = aliyun (可选)
```

---

## 📊 部署后检查

### 功能验证

```bash
# 1. 访问应用
curl https://ai-stats-dashboard.pages.dev

# 2. 检查页面加载
# 应该看到 AI 功能数据统计平台首页

# 3. 验证 API 连接
# 打开浏览器开发者工具 → Network 标签
# 查看是否有 /api/v1/... 请求
```

### 性能检查

```bash
# 1. 检查加载时间
# Network 标签 → 查看总加载时间（应 < 3s）

# 2. 检查文件大小
# 应用总大小 < 300KB (gzip)

# 3. 检查 Lighthouse 评分
# 应该在 90+ 以上
```

### 日志检查

```
GitHub Actions 日志：
- Settings → Actions secrets 已正确配置
- 最近工作流运行成功

Cloudflare 日志：
- Pages → 项目 → 部署历史
- 最新部署显示 ✅ 成功
```

---

## 🆘 常见问题

| 问题 | 解决方案 |
|------|--------|
| 构建失败 | 检查 GitHub Actions 日志，通常是依赖或类型错误 |
| 部署失败 | 验证 Secrets 正确配置，检查 Cloudflare 配置 |
| 应用无法访问 | 等待 DNS 传播（最多 24 小时），检查自定义域名 DNS |
| API 请求失败 | 检查 VITE_API_BASE_URL 环境变量配置 |
| 页面显示错误 | 清除浏览器缓存，检查浏览器控制台错误 |

---

## 📚 文档导航

- **README.md** - 项目详细说明
- **GITHUB_DEPLOYMENT_CHECKLIST.md** - 详细部署清单
- **REPOSITORY_SETUP_GUIDE.md** - 仓库设置指南
- **DATA_SOURCE_MIGRATION_GUIDE.md** - 数据源架构说明

---

## ⚡ 后续优化

### 立即优化

```bash
# 1. 分析包体积
pnpm build --analyze

# 2. 更新依赖
pnpm update

# 3. 性能优化
# 查看构建输出大小
ls -lh dist/
```

### 中期优化

- [ ] 配置 API 后端真实数据源
- [ ] 设置实时数据更新
- [ ] 配置告警和监控
- [ ] 优化缓存策略

### 长期维护

- [ ] 定期更新依赖安全补丁
- [ ] 监控应用性能指标
- [ ] 收集用户反馈和优化
- [ ] 新功能开发迭代

---

## 🎯 典型部署流程

```
Day 1：
├─ 创建 GitHub 仓库
├─ 推送代码到 main
└─ 创建 GitHub Secrets

Day 2：
├─ 连接 Cloudflare Pages
├─ 配置构建设置
└─ 首次部署成功 ✅

Day 3+：
├─ 测试应用功能
├─ 配置 API 后端
├─ 配置自定义域名
└─ 上线使用 🚀
```

---

**更新时间**：2025-01-05  
**适用版本**：fenxi-dashboard v1.0.0+  
**维护状态**：✅ 完全准备好

---

💡 **提示**：需要详细步骤？请参考 `GITHUB_DEPLOYMENT_CHECKLIST.md`
