import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-sm border border-neutral-300 bg-white px-3 text-base text-neutral-800 placeholder-neutral-400 transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
export type { InputProps }
