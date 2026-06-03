# 🚀 Vercel 部署指南

## 前置条件

1. GitHub 账号
2. Vercel 账号（可用 GitHub 登录）
3. 代码已推送到 GitHub

## 部署步骤

### 1. 推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/baby-planet.git
git branch -M main
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Add New..."** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 找到 `baby-planet` 仓库，点击 **"Import"**

### 3. 配置项目

在 Vercel 配置页面：

| 设置 | 值 |
|------|-----|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` |
| **Build Command** | `prisma generate && next build` |
| **Output Directory** | `.next` |

### 4. 添加环境变量

点击 **"Environment Variables"**，添加以下变量：

#### Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL = https://idwcuvqskvuqpjizfpwl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL = postgresql://postgres.idwcuvqskvuqpjizfpwl:xjl%40123.com@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL = postgresql://postgres.idwcuvqskvuqpjizfpwl:xjl%40123.com@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### NextAuth 配置
```
NEXTAUTH_URL = https://你的域名.vercel.app
NEXTAUTH_SECRET = 运行 openssl rand -base64 32 生成
```

#### Supabase Storage
```
SUPABASE_URL = https://idwcuvqskvuqpjizfpwl.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STORAGE_PROVIDER = supabase
```

#### 其他（可选）
```
GOOGLE_CLIENT_ID = 
GOOGLE_CLIENT_SECRET = 
VAPID_PUBLIC_KEY = 
VAPID_PRIVATE_KEY = 
BREVO_API_KEY = 
```

### 5. 部署

点击 **"Deploy"** 按钮，等待 2-3 分钟完成部署。

## 部署后配置

### 1. 更新 NEXTAUTH_URL

部署完成后，Vercel 会给你一个域名（如 `baby-planet.vercel.app`）。

需要更新环境变量：
- `NEXTAUTH_URL` = `https://baby-planet.vercel.app`

### 2. 更新 Supabase Redirect URLs

在 Supabase 控制台：
1. 进入 **Authentication** → **URL Configuration**
2. 添加 **Redirect URLs**：
   - `https://baby-planet.vercel.app/auth/callback`
   - `https://baby-planet.vercel.app`

### 3. 配置自定义域名（可选）

在 Vercel 项目设置：
1. 进入 **Settings** → **Domains**
2. 添加你的域名
3. 按提示配置 DNS

## 自动部署

连接 GitHub 后，每次推送代码到 `main` 分支，Vercel 会自动重新部署。

## 环境变量管理

### 生产环境 vs 预览环境

Vercel 支持为不同环境设置不同的环境变量：

- **Production** - 主分支部署
- **Preview** - PR 和其他分支部署
- **Development** - 本地开发

建议：
- 生产环境使用真实的 Supabase 项目
- 预览环境可以使用测试 Supabase 项目

## 常见问题

### Q: 部署失败，提示 Prisma 错误？

A: 确保 `DATABASE_URL` 和 `DIRECT_URL` 环境变量正确设置。

### Q: 页面显示 500 错误？

A: 检查 Vercel 的 **Functions** 日志，查看具体错误信息。

### Q: OAuth 登录不工作？

A: 确保在 Supabase 和 Google Cloud Console 都添加了生产域名的回调 URL。

### Q: 图片上传失败？

A: 检查 Supabase Storage 的 bucket 是否设置为 public，以及 CORS 配置。

## 监控和分析

Vercel 提供免费的：
- **Analytics** - 页面访问统计
- **Speed Insights** - 性能监控
- **Logs** - 函数日志

在项目设置中启用这些功能。

## 成本

Vercel 免费层包含：
- 100GB 带宽/月
- 无限部署
- 自动 HTTPS
- 全球 CDN

对于个人项目完全够用。
