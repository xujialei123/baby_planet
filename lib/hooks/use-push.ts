'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Web Push 订阅 Hook
 */
export function usePush() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Check push subscription error:', error)
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) return
    setLoading(true)

    try {
      // 请求通知权限
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('通知权限被拒绝')
      }

      // 获取 VAPID 公钥
      const res = await fetch('/api/push/vapid-key')
      const { publicKey } = await res.json()

      // 订阅推送
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      })

      // 保存订阅到服务器
      const { endpoint, keys } = subscription.toJSON() as any
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, keys }),
      })

      setIsSubscribed(true)
    } catch (error) {
      console.error('Subscribe push error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
      }

      setIsSubscribed(false)
    } catch (error) {
      console.error('Unsubscribe push error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { isSupported, isSubscribed, loading, subscribe, unsubscribe }
}
