'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">🌍</div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-gray-600">登录宝贝星球</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-600">记住我</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-pink-500 hover:text-pink-600">
              忘记密码？
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-pink-500 py-3 text-white hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">或</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 py-3 hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          使用 Google 账号登录
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          还没有账号？{' '}
          <Link href="/auth/register" className="text-pink-500 hover:text-pink-600">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
