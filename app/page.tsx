'use client'

import Link from 'next/link'
import { useAuth } from '@/components/layout/auth-provider'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🌍</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <AuthenticatedHome userName={user.user_metadata?.name || user.email?.split('@')[0] || '用户'} />
  }

  return <LandingPage />
}

function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-6 text-8xl">🌍</div>
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          宝贝星球
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          陪伴宝宝每一步成长的智能育儿助手
        </p>

        <div className="mb-12 grid max-w-md gap-4 text-left">
          <div className="flex items-start gap-3 rounded-xl bg-pink-50 p-4">
            <span className="text-2xl">📝</span>
            <div>
              <h3 className="font-semibold">轻松记录</h3>
              <p className="text-sm text-gray-600">喂养、睡眠、换尿布，一键记录</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
            <span className="text-2xl">📈</span>
            <div>
              <h3 className="font-semibold">生长曲线</h3>
              <p className="text-sm text-gray-600">WHO 标准百分位，科学追踪发育</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-semibold">AI 智能</h3>
              <p className="text-sm text-gray-600">照片自动分类，零成本 AI 识别</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-purple-50 p-4">
            <span className="text-2xl">👩‍⚕️</span>
            <div>
              <h3 className="font-semibold">专家咨询</h3>
              <p className="text-sm text-gray-600">在线问诊，每月 2 次免费咨询</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/register"
            className="rounded-xl bg-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-pink-600"
          >
            免费注册
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl border-2 border-pink-500 px-8 py-4 text-lg font-semibold text-pink-500 hover:bg-pink-50"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  )
}

function AuthenticatedHome({ userName }: { userName: string }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 你好，{userName}！
        </h1>
        <p className="text-gray-600">今天宝宝怎么样？</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link
          href="/baby"
          className="flex flex-col items-center rounded-2xl bg-pink-50 p-6 transition-transform hover:scale-105"
        >
          <span className="mb-2 text-4xl">👶</span>
          <span className="font-semibold">我的宝宝</span>
          <span className="text-sm text-gray-500">记录成长</span>
        </Link>
        <Link
          href="/community"
          className="flex flex-col items-center rounded-2xl bg-blue-50 p-6 transition-transform hover:scale-105"
        >
          <span className="mb-2 text-4xl">💬</span>
          <span className="font-semibold">社区</span>
          <span className="text-sm text-gray-500">交流分享</span>
        </Link>
        <Link
          href="/knowledge"
          className="flex flex-col items-center rounded-2xl bg-green-50 p-6 transition-transform hover:scale-105"
        >
          <span className="mb-2 text-4xl">📚</span>
          <span className="font-semibold">知识库</span>
          <span className="text-sm text-gray-500">育儿百科</span>
        </Link>
        <Link
          href="/expert"
          className="flex flex-col items-center rounded-2xl bg-purple-50 p-6 transition-transform hover:scale-105"
        >
          <span className="mb-2 text-4xl">👩‍⚕️</span>
          <span className="font-semibold">专家咨询</span>
          <span className="text-sm text-gray-500">在线问诊</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 p-6">
        <h2 className="mb-2 font-semibold">🎵 白噪音</h2>
        <p className="mb-4 text-sm text-gray-600">帮助宝宝安然入睡</p>
        <Link
          href="/tools/white-noise"
          className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-pink-500 shadow hover:bg-gray-50"
        >
          开始播放
        </Link>
      </div>
    </div>
  )
}
