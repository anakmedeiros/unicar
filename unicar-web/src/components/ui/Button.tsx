import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const base = 'inline-flex items-center gap-1.5 font-medium rounded-[5px] transition-colors cursor-pointer border select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red'

const variants = {
  primary:   'bg-red border-red text-white hover:bg-[#C41928] hover:border-[#C41928]',
  secondary: 'bg-white border-line text-ink hover:bg-fill hover:border-ink-3',
  ghost:     'bg-transparent border-transparent text-ink hover:bg-fill',
}

const sizes = {
  sm: 'px-[9px] py-[5px] text-[11px]',
  md: 'px-3 py-[7px] text-[12px]',
  lg: 'px-4 py-[10px] text-[13px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
