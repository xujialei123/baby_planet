'use client'

import { useState, useCallback } from 'react'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

/**
 * 通用 API 请求 Hook
 */
export function useApi<T = any>(options?: UseApiOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (url: string, init?: RequestInit) => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
          ...init,
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || `请求失败: ${res.status}`)
        }

        const result = await res.json()
        setData(result)
        options?.onSuccess?.(result)
        return result
      } catch (err: any) {
        const message = err.message || '请求失败'
        setError(message)
        options?.onError?.(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  return { data, loading, error, execute, setData }
}

/**
 * GET 请求 Hook
 */
export function useFetch<T = any>(url: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('请求失败')
      const result = await res.json()
      setData(result)
      return result
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  return { data, loading, error, refetch, setData }
}
