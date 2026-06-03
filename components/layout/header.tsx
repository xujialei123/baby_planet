'use client'

import Link from 'next/link'
import { useAuth } from './auth-provider'

export function Header() {
  const { user, loading, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="text-xl font-bold text-pink-500">宝贝星球</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/baby" className="text-gray-600 hover:text-pink-500">
            宝宝
          </Link>
          <Link href="/community" className="text-gray-600 hover:text-pink-500">
            社区
          </Link>
          <Link href="/knowledge" className="text-gray-600 hover:text-pink-500">
            知识
          </Link>
          <Link href="/expert" className="text-gray-600 hover:text-pink-500">
            专家
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="relative group">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  {user.user_metadata?.name?.[0] || user.email?.[0]?.toUpperCase()}
                </button>
                <div className="absolute right-0 top-full hidden w-48 rounded-lg border bg-white py-2 shadow-lg group-hover:block">
                  <Link
                    href="/family/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👨‍👩‍👧 家庭设置
                  </Link>
                  <Link
                    href="/tools/white-noise"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🎵 白噪音
                  </Link>
                  <Link
                    href="/tools/report"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 生成报告
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={signOut}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                登录
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-pink-500 px-4 py-2 text-sm text-white hover:bg-pink-600"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
