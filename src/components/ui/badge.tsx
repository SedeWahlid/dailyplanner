'use client'

import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: string
  className?: string
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant || 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
        className
      )}
    >
      {children}
    </span>
  )
}
