import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const initials = alt.slice(0, 1).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-100 font-bold text-primary-600',
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  )
}
