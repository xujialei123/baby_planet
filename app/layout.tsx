import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/layout/auth-provider'
import { Header } from '@/components/layout/header'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '宝贝星球 - 智能育儿助手',
    template: '%s | 宝贝星球',
  },
  description: '陪伴宝宝每一步成长的智能育儿助手，记录喂养、睡眠、生长曲线，AI自动标签照片，专家在线咨询。',
  keywords: ['育儿', '宝宝', '喂养记录', '生长曲线', '疫苗', '育儿社区'],
  authors: [{ name: '宝贝星球团队' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '宝贝星球',
    title: '宝贝星球 - 智能育儿助手',
    description: '陪伴宝宝每一步成长的智能育儿助手',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffb5c2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-screen-sm">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
