# Supabase 配置指南

## 1. 创建 Supabase 项目

### 1.1 注册并创建项目
1. 访问 [supabase.com](https://supabase.com) 注册账号
2. 点击 **"New Project"**
3. 填写信息：
   - **Organization**: 选择或创建组织
   - **Project name**: `baby-planet`
   - **Database password**: 设置一个强密码（记住它！）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
4. 点击 **"Create new project"**
5. 等待 1-2 分钟初始化完成

### 1.2 获取连接信息
项目创建完成后，进入 **Settings → Database**：

```
Connection string → URI
```

你会看到类似这样的连接字符串：
```
postgresql://postgres.abcdefghijklm:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

## 2. 配置环境变量

### 2.1 创建 .env.local 文件
```bash
cp .env.example .env.local
```

### 2.2 填写 Supabase 配置
```env
# ============================================
# Supabase 数据库（必填）
# ============================================

# 连接池 URL（用于 Prisma Client 查询）
# 格式: postgresql://postgres.[项目ID]:[密码]@aws-0-[区域].pooler.supabase.com:6543/postgres
DATABASE_URL="postgresql://postgres.abcdefghijklm:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# 直接连接 URL（用于 Prisma migrations）
# 注意端口号是 5432 不是 6543
DIRECT_URL="postgresql://postgres.abcdefghijklm:your-password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

# ============================================
# Supabase Storage（用于文件上传）
# ============================================

# 项目 URL
SUPABASE_URL="https://abcdefghijklm.supabase.co"

# 匿名 Key（公开，前端使用）
# 在 Settings → API → anon public key
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 服务端 Key（保密！后端使用）
# 在 Settings → API → service_role secret key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 存储提供者（使用 Supabase Storage 替代 R2）
STORAGE_PROVIDER="supabase"

# ============================================
# NextAuth（必填）
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="运行命令生成: openssl rand -base64 32"
```

## 3. 初始化数据库

### 3.1 安装依赖
```bash
npm install
```

### 3.2 生成 Prisma Client
```bash
npx prisma generate
```

### 3.3 推送数据库 Schema
```bash
npx prisma db push
```

这会在 Supabase 数据库中创建所有表。

### 3.4 验证数据库
打开 Supabase 控制台，进入 **Table Editor**，你应该能看到创建的表：
- User, Account, Session
- Family, FamilyMember
- Baby, DailyRecord, GrowthRecord
- Vaccine, VaccineRecord
- Milestone, MilestoneRecord
- Photo, PhotoAlbum
- Article, ArticleCategory
- Circle, Post, Comment, Like
- Expert, Consultation, ChatMessage
- PointBalance, PointTransaction
- PushSubscription, Notification
- SensitiveWord, ModerationLog

## 4. 创建 Storage Bucket

### 4.1 进入 Storage 设置
Supabase 控制台 → **Storage**

### 4.2 创建 Bucket
1. 点击 **"New bucket"**
2. 填写：
   - **Name**: `baby-planet`
   - **Public bucket**: ✅ 勾选（允许公开访问）
3. 点击 **"Create bucket"**

### 4.3 设置 Bucket 策略（可选）
如果你想限制访问，可以设置 RLS 策略：

```sql
-- 允许认证用户上传
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'baby-planet');

-- 允许公开读取
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'baby-planet');
```

## 5. 填充种子数据

```bash
npm run db:seed
```

这会创建：
- 测试用户（test@babyplanet.com / Test1234）
- 测试家庭和宝宝
- 知识库分类和示例文章
- 社区圈子
- 敏感词库

## 6. 配置 OAuth（可选）

### 6.1 Google OAuth
1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建项目 → APIs & Services → Credentials
3. Create OAuth Client ID
4. 设置回调 URL: `http://localhost:3000/api/auth/callback/google`
5. 将 Client ID 和 Secret 填入 .env.local

### 6.2 微信 OAuth（需要企业资质）
1. 访问 [微信开放平台](https://open.weixin.qq.com)
2. 创建网站应用
3. 获取 AppID 和 AppSecret

## 7. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 8. Supabase 免费额度

| 资源 | 免费额度 |
|------|----------|
| 数据库 | 500MB |
| Storage | 1GB |
| 带宽 | 2GB/月 |
| API 请求 | 50,000/月 |
| 实时连接 | 200 |
| Auth 用户 | 无限 |

## 9. 常见问题

### Q: Prisma 连接超时？
A: 使用连接池 URL（端口 6543），不要用直接连接。

### Q: 如何查看数据库？
A: 运行 `npx prisma studio` 打开可视化界面，或使用 Supabase 控制台的 Table Editor。

### Q: 如何迁移到生产环境？
A: 在 Supabase 创建新项目，更新 DATABASE_URL，运行 `npx prisma db push`。

### Q: Storage 上传失败？
A: 检查 bucket 是否为 public，检查 SUPABASE_SERVICE_ROLE_KEY 是否正确。

## 10. 生产环境部署

### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量（与 .env.local 相同）
4. 部署

### 数据库备份
Supabase 免费层不包含自动备份，建议：
1. 定期导出：`pg_dump` 或 Supabase 控制台
2. 使用 Supabase CLI 备份

---

**完成！** 现在你的宝贝星球项目已经连接到 Supabase 数据库了。
