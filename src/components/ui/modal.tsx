'use client'

import { Fragment, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null

  return (
    <Fragment>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className={clsx('relative z-50 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-slate-900/50', sizeClasses[size])}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h2>}
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </Fragment>
  )
}
