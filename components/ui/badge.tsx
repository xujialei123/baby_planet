import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'mint' | 'lavender' | 'honey' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        {
          'bg-neutral-100 text-neutral-600': variant === 'default',
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-mint-100 text-mint-700': variant === 'mint',
          'bg-lavender-100 text-lavender-700': variant === 'lavender',
          'bg-honey-100 text-honey-700': variant === 'honey',
          'bg-red-100 text-red-700': variant === 'danger',
        },
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
