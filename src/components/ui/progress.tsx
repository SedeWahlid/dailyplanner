'use client'

import { clsx } from 'clsx'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, size = 'md', color = 'bg-indigo-600', showLabel = false }: ProgressProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  return (
    <div className="w-full">
      <div className={clsx('w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx(color, heights[size], 'rounded-full transition-all duration-500 ease-out')}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 text-right">{percent}%</p>}
    </div>
  )
}
