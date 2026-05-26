'use client'

import type { ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm',
        hover && 'hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-gray-300 dark:hover:border-slate-600 transition-shadow cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
