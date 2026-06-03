'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/layout/auth-provider'
import { PageHeader } from '@/components/layout'
import { Card, Button } from '@/components/ui'

const NOISES = [
  { id: 'rain', name: '雨声', icon: '🌧️', description: '轻柔的雨滴声' },
  { id: 'ocean', name: '海浪', icon: '🌊', description: '海浪拍岸声' },
  { id: 'forest', name: '森林', icon: '🌲', description: '鸟鸣与风声' },
  { id: 'fan', name: '风扇', icon: '🌀', description: '轻柔的风扇声' },
  { id: 'heartbeat', name: '心跳', icon: '💓', description: '妈妈的心跳声' },
  { id: 'womb', name: '子宫', icon: '🤰', description: '模拟子宫环境音' },
]

export default function WhiteNoisePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [playing, setPlaying] = useState<string | null>(null)
  const [timer, setTimer] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tools/white-noise')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setPlaying(null)
            setTimer(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer, remainingTime])

  const togglePlay = (id: string) => {
    if (playing === id) {
      setPlaying(null)
      setTimer(null)
      setRemainingTime(0)
    } else {
      setPlaying(id)
    }
  }

  const setAutoOff = (minutes: number) => {
    setTimer(minutes)
    setRemainingTime(minutes * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 加载中显示
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎵</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录不显示内容
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PageHeader title="白噪音" subtitle="帮助宝宝安然入睡" showBack />

      {/* 当前播放 */}
      {playing && (
        <div className="mx-4 mb-4 rounded-lg bg-gradient-to-r from-lavender-100 to-primary-100 p-4 text-center">
          <p className="text-4xl">
            {NOISES.find((n) => n.id === playing)?.icon}
          </p>
          <p className="mt-2 font-semibold text-neutral-700">
            正在播放：{NOISES.find((n) => n.id === playing)?.name}
          </p>
          {timer && (
            <p className="mt-1 text-sm text-neutral-500">
              自动关闭：{formatTime(remainingTime)}
            </p>
          )}
        </div>
      )}

      {/* 音效选择 */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {NOISES.map((noise) => (
          <Card
            key={noise.id}
            variant={playing === noise.id ? 'elevated' : 'outlined'}
            padding="md"
            className={`cursor-pointer text-center transition-all ${
              playing === noise.id
                ? 'border-primary-300 bg-primary-50'
                : ''
            }`}
            onClick={() => togglePlay(noise.id)}
          >
            <p className="text-3xl">{noise.icon}</p>
            <p className="mt-2 font-semibold text-neutral-700">{noise.name}</p>
            <p className="text-xs text-neutral-500">{noise.description}</p>
          </Card>
        ))}
      </div>

      {/* 定时关闭 */}
      {playing && (
        <div className="px-4 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-600">
            定时关闭
          </h3>
          <div className="flex gap-2">
            {[15, 30, 60, 120].map((mins) => (
              <Button
                key={mins}
                variant={timer === mins ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setAutoOff(mins)}
              >
                {mins}分钟
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
