# GitHub + Cloudflare Pages 部署清单

完成以下步骤，将项目部署到 Cloudflare Pages：

---

## ✅ 第一步：GitHub 仓库准备

### 1.1 在 GitHub 创建新仓库

- [ ] 访问 https://github.com/new
- [ ] 仓库名：`ai-stats-dashboard`
- [ ] 描述：`AI 功能数据统计平台 - 前端仪表板`
- [ ] 访问性：**Public**（GitHub Pages 必需）
- [ ] 初始化选项：选择 "Add a README file"（可选）
- [ ] 点击 "Create repository"

### 1.2 将本地代码推送到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/ai-stats-dashboard.git

# 重命名分支
git branch -M main

# 首次推送
git push -u origin main

# 验证推送成功
git remote -v
```

---

## 🔑 第二步：Cloudflare 账户配置

### 2.1 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 访问 "My Account" → "API Tokens"
3. 点击 "Create Token"
4. 使用模板 "Edit Cloudflare Workers"（或自定义权限）
5. 复制生成的 **API Token**（保妥善保管！）

### 2.2 获取 Cloudflare Account ID

1. 在 Cloudflare Dashboard 首页，右侧边栏可以看到 "Account ID"
2. 点击复制您的 **Account ID**

### 2.3 记录凭证

```
Cloudflare Account ID: ___________________
Cloudflare API Token:   ___________________
```

---

## 🔐 第三步：GitHub Secrets 配置

在 GitHub 仓库中添加部署所需的密钥：

### 3.1 访问 Secrets 设置

1. 打开仓库页面：https://github.com/YOUR_USERNAME/ai-stats-dashboard
2. 点击 "Settings" 标签
3. 左侧菜单选择 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"

### 3.2 添加必需的 Secrets

**Secret 1：CLOUDFLARE_ACCOUNT_ID**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Secret: 粘贴您的 Cloudflare Account ID
- 点击 "Add secret"

**Secret 2：CLOUDFLARE_API_TOKEN**
- Name: `CLOUDFLARE_API_TOKEN`
- Secret: 粘贴您的 Cloudflare API Token
- 点击 "Add secret"

### 3.3 添加环境变量（可选）

如需自定义环境变量：

**Secret 3：VITE_API_BASE_URL**
- Name: `VITE_API_BASE_URL`
- Secret: `https://api.example.com`

**Secret 4：VITE_DATA_SOURCE**
- Name: `VITE_DATA_SOURCE`
- Secret: `aliyun`（或 `mock`）

---

## 🚀 第四步：Cloudflare Pages 部署

### 4.1 通过 Cloudflare Dashboard 连接（方式 A）

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择左侧菜单 "Workers & Pages" → "Pages"
3. 点击 "Create a project"
4. 选择 "Connect to Git"
5. 授权 GitHub（如未授权）
6. 选择仓库：`ai-stats-dashboard`
7. 配置构建设置：
   - **Framework preset**: React
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Environment variables**（可选）：
     ```
     VITE_API_BASE_URL = https://api.example.com
     VITE_DATA_SOURCE = aliyun
     ```
8. 点击 "Save and Deploy"

### 4.2 自动部署验证

- [ ] GitHub Actions 工作流自动触发
- [ ] 检查 GitHub Actions 页面的运行状态
- [ ] 等待 "Deploy to Cloudflare Pages" 完成
- [ ] 部署成功后访问 `https://ai-stats-dashboard.pages.dev`

---

## 🌐 第五步：域名配置（可选）

### 5.1 设置自定义域名

1. 在 Cloudflare Pages 项目页面，选择 "Custom domains"
2. 点击 "Setup custom domain"
3. 输入您的域名（如 `dashboard.example.com`）
4. 按照提示完成 DNS 配置

### 5.2 验证 DNS 配置

```bash
# 检查 DNS 解析
nslookup dashboard.example.com

# 应该指向 Cloudflare 的 DNS
```

---

## 📋 第六步：部署验证

### 6.1 访问部署的应用

- [ ] 访问 `https://ai-stats-dashboard.pages.dev`
- [ ] 或访问您的自定义域名
- [ ] 验证页面正常加载

### 6.2 检查功能

- [ ] 首页加载正常
- [ ] 模块切换工作正常
- [ ] 日期选择器响应
- [ ] 图表正确渲染
- [ ] API 请求成功（检查浏览器控制台）

### 6.3 查看构建日志

1. 在 Cloudflare Pages 项目页面
2. 点击最新的部署
3. 查看 "Build log" 确保无错误

---

## 🔄 第七步：持续部署配置

### 7.1 验证 GitHub Actions 工作流

- [ ] 检查 `.github/workflows/deploy.yml` 文件已上传
- [ ] 访问 GitHub 仓库 "Actions" 标签
- [ ] 查看最新运行的工作流
- [ ] 确认 "Deploy to Cloudflare Pages" 步骤成功

### 7.2 自动部署流程

当您推送代码到 `main` 分支时：

```
推送代码 → GitHub Actions 触发
       → 安装依赖
       → 代码检查
       → 类型检查
       → 构建
       → Cloudflare Pages 部署
       → 部署完成 ✅
```

---

## 🧪 第八步：测试部署流程

### 8.1 本地测试

```bash
# 构建本地版本
pnpm build

# 预览构建结果
pnpm preview

# 访问 http://localhost:4173
```

### 8.2 提交测试

```bash
# 创建测试分支
git checkout -b test/deployment

# 做一个小改动（如更新注释）
echo "# Test deployment" >> README.md

# 提交并推送
git add .
git commit -m "test: verify deployment workflow"
git push origin test/deployment

# 创建 Pull Request
# 观察 GitHub Actions 运行
# 验证预览部署

# 合并到 main 触发生产部署
```

---

## 🚨 常见问题排查

### 问题 1：构建失败

```bash
# 检查日志
# GitHub Actions → 最近运行 → Build

# 常见原因：
# - 依赖未安装
# - 环境变量缺失
# - TypeScript 类型错误

# 解决方案：
git pull
pnpm install
pnpm lint
pnpm type-check
pnpm build
```

### 问题 2：API 请求失败

- [ ] 检查 `VITE_API_BASE_URL` 环境变量
- [ ] 验证后端 API 服务正常运行
- [ ] 检查浏览器控制台的 CORS 错误
- [ ] 确认 API 地址在部署时正确设置

### 问题 3：页面样式不正常

- [ ] 清除浏览器缓存
- [ ] 检查 CSS 构建输出
- [ ] 验证 Tailwind CSS 配置
- [ ] 检查 `dist` 目录中的 CSS 文件

### 问题 4：GitHub Actions 不运行

- [ ] 检查 `.github/workflows/deploy.yml` 文件路径
- [ ] 验证 Secrets 已正确配置
- [ ] 检查分支是否为 `main`
- [ ] 重新触发：创建新的 commit 并推送

---

## 📊 部署统计

部署完成后，您可以在以下地方查看统计数据：

- **Cloudflare Pages**: https://dash.cloudflare.com
  - 构建次数
  - 请求数
  - 缓存命中率
  - 性能指标

- **GitHub Actions**: 仓库的 "Actions" 标签
  - 工作流运行时间
  - 构建日志
  - 部署历史

---

## 🎉 部署成功！

恭喜！🎊 您已经成功将 AI 功能数据统计平台的前端仪表板部署到 Cloudflare Pages！

### 后续步骤

1. **配置后端 API**（如尚未完成）
   - 设置正确的 `VITE_API_BASE_URL`
   - 确保后端 API 正常运行

2. **配置真实数据源**（可选）
   - 如需使用阿里云数据源，配置阿里云凭证
   - 参考 `DATA_SOURCE_MIGRATION_GUIDE.md`

3. **监控和维护**
   - 定期检查部署状态
   - 监控应用性能
   - 收集用户反馈

4. **持续改进**
   - 定期更新依赖
   - 优化代码性能
   - 新功能开发和测试

---

## 📞 获取帮助

- 📖 查看项目 README.md
- 📚 参考 DATA_SOURCE_MIGRATION_GUIDE.md
- 🐛 在 GitHub Issues 中报告问题
- 💬 在 GitHub Discussions 中提出建议

---

**部署完成时间**：[记录您的部署日期]  
**部署地址**：https://ai-stats-dashboard.pages.dev  
**自定义域名**：[如已配置]  

祝部署顺利！🚀
