import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 需要登录才能访问的路由
const protectedRoutes = [
  '/baby',
  '/family',
  '/community/new',
  '/tools',
]

// 公开路由（不需要登录）
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/logout',
  '/community',
  '/knowledge',
  '/expert',
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 获取用户信息
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 检查是否是需要保护的路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // 如果是需要保护的路由且用户未登录，重定向到登录页面
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 如果用户已登录且访问登录/注册页面，重定向到首页
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
