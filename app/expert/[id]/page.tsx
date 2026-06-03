'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Badge, Button } from '@/components/ui'

const EXPERT = {
  id: '1',
  name: '张医生',
  title: '儿科主任医师',
  specialty: '新生儿护理、儿童营养',
  rating: 4.9,
  consultations: 328,
  price: 50,
  bio: '从事儿科临床工作20年，擅长新生儿护理、儿童营养指导。曾在北京儿童医院工作15年，现为独立执业儿科医生。',
  isAvailable: true,
  availableSlots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
}

export default function ExpertDetailPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showBooking, setShowBooking] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PageHeader title="专家详情" showBack />

      {/* 专家信息卡片 */}
      <div className="mx-4 mb-4">
        <Card variant="elevated" padding="lg">
          <div className="flex items-start gap-4">
            <Avatar alt={EXPERT.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-neutral-800">{EXPERT.name}</h2>
                {EXPERT.isAvailable ? (
                  <Badge variant="mint">在线</Badge>
                ) : (
                  <Badge variant="default">离线</Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500">{EXPERT.title}</p>
              <p className="text-xs text-neutral-400">{EXPERT.specialty}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span>⭐ {EXPERT.rating}</span>
                <span>📋 {EXPERT.consultations}次咨询</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 价格信息 */}
      <div className="mx-4 mb-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">咨询费用</p>
              <p className="text-2xl font-bold text-primary-600">{EXPERT.price} 积分</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">我的积分</p>
              <p className="text-2xl font-bold text-mint-600">120</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 专家简介 */}
      <div className="mx-4 mb-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-600">专家简介</h3>
        <Card variant="outlined" padding="md">
          <p className="text-sm text-neutral-600">{EXPERT.bio}</p>
        </Card>
      </div>

      {/* 预约按钮 */}
      <div className="px-4">
        <Button
          className="w-full"
          onClick={() => setShowBooking(true)}
          disabled={!EXPERT.isAvailable}
        >
          {EXPERT.isAvailable ? '立即预约' : '暂不在线'}
        </Button>
      </div>

      {/* 预约浮层 */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-screen-sm rounded-t-xl bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">预约咨询</h3>
              <button onClick={() => setShowBooking(false)} className="text-neutral-400">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                选择日期
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-sm border border-neutral-300 px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                选择时间
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPERT.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-sm border-2 py-2 text-sm transition-all ${
                      selectedTime === slot
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-sm bg-neutral-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">咨询费用</span>
                <span className="font-bold text-primary-600">{EXPERT.price} 积分</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">剩余积分</span>
                <span className="font-bold text-mint-600">120</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setShowBooking(false)
                alert('预约成功！')
              }}
            >
              确认预约
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
