'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Activity,
  FileText,
  Target,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { useAppStore } from '@/lib/stores/app-store'
import { APP_NAME } from '@/lib/constants'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Activity,
  FileText,
  Target,
  Settings,
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { href: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
  { href: '/habits', label: 'Habits', icon: 'Activity' },
  { href: '/notes', label: 'Notes', icon: 'FileText' },
  { href: '/goals', label: 'Goals', icon: 'Target' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const ui = useAppStore((s) => s.ui)
  const sidebarCollapsed = ui.sidebarCollapsed

  const isExpanded = !sidebarCollapsed || ui.sidebarHovered

  return (
    <>
      {ui.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={clsx(
          'fixed lg:sticky top-0 z-50 flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300',
          sidebarCollapsed && !ui.sidebarHovered ? 'w-[68px]' : 'w-60',
          ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        onMouseEnter={() => useAppStore.getState().setUI('sidebarHovered', true)}
        onMouseLeave={() => useAppStore.getState().setUI('sidebarHovered', false)}
      >
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700">
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm truncate">{APP_NAME}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 mx-auto">
                <span className="text-white font-bold text-sm">D</span>
              </div>
            </div>
          )}
          <button
            onClick={toggleSidebarCollapsed}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className={clsx('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => useAppStore.getState().setUI('sidebarOpen', false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800',
                  !isExpanded && 'justify-center px-2'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          {isExpanded ? (
            <div className="text-xs text-gray-400 dark:text-slate-500">
              <p>v1.0.0</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="text-xs text-gray-400 dark:text-slate-500">v1</span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
