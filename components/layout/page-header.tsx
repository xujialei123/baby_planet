'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  transparent?: boolean
  showBack?: boolean
  onBack?: () => void
}

export function PageHeader({
  title,
  subtitle,
  action,
  className,
  transparent,
  showBack = false,
  onBack,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between px-4 py-3',
        transparent
          ? 'bg-transparent'
          : 'border-b border-neutral-100 bg-white/95 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <svg
              className="h-5 w-5 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-neutral-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
