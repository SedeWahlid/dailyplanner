import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TaskFilters {
  search: string
  categoryId: string | null
  priority: number | null
  showCompleted: boolean
  sortBy: 'due_date' | 'priority' | 'created_at' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface Settings {
  theme: 'light' | 'dark' | 'system'
  defaultCalendarView: 'day' | 'week' | 'month'
  weekStartsOn: 0 | 1
}

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  sidebarHovered: boolean
}

interface AppStore {
  taskFilters: TaskFilters
  settings: Settings
  ui: UIState
  setTaskFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  resetTaskFilters: () => void
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  setUI: <K extends keyof UIState>(key: K, value: UIState[K]) => void
  toggleSidebar: () => void
  toggleSidebarCollapsed: () => void
}

const defaultTaskFilters: TaskFilters = {
  search: '',
  categoryId: null,
  priority: null,
  showCompleted: false,
  sortBy: 'due_date',
  sortOrder: 'asc',
}

const defaultSettings: Settings = {
  theme: 'system',
  defaultCalendarView: 'week',
  weekStartsOn: 1,
}

const defaultUI: UIState = {
  sidebarOpen: false,
  sidebarCollapsed: false,
  sidebarHovered: false,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      taskFilters: defaultTaskFilters,
      settings: defaultSettings,
      ui: defaultUI,
      setTaskFilter: (key, value) =>
        set((state) => ({ taskFilters: { ...state.taskFilters, [key]: value } })),
      resetTaskFilters: () => set({ taskFilters: defaultTaskFilters }),
      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
      setUI: (key, value) =>
        set((state) => ({ ui: { ...state.ui, [key]: value } })),
      toggleSidebar: () =>
        set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } })),
      toggleSidebarCollapsed: () =>
        set((state) => ({ ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } })),
    }),
    {
      name: 'dailyplanner-store',
      partialize: (state) => ({
        settings: state.settings,
        ui: { sidebarCollapsed: state.ui.sidebarCollapsed },
      }),
    }
  )
)
