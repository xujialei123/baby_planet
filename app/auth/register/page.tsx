'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      // 使用 Supabase Auth 注册
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // 注册成功，创建用户积分账户
        if (data.user.id) {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              name: name,
            }),
          })

          if (!response.ok) {
            console.error('Failed to create user profile')
          }
        }

        setSuccess(true)
        // 如果邮箱确认已禁用，直接跳转
        if (data.session) {
          router.push('/family/settings')
        }
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试')
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mb-4 text-6xl">✉️</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">查看您的邮箱</h1>
            <p className="mb-6 text-gray-600">
              我们已向 <strong>{email}</strong> 发送了确认链接，请点击链接完成注册。
            </p>
            <Link
              href="/auth/login"
              className="inline-block rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600"
            >
              返回登录
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mb-2 text-5xl">🌍</div>
          <h1 className="text-2xl font-bold text-gray-800">加入宝贝星球</h1>
          <p className="text-gray-600">创建账号，记录宝宝成长</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的姓名"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none"
              required
            />
          </div>

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
              placeholder="至少6位密码"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:outline-none"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-pink-500 py-3 text-white hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
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
          使用 Google 账号注册
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/auth/login" className="text-pink-500 hover:text-pink-600">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
