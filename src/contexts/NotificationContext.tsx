import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

export type Notification = {
  id: string
  message: string
  type: 'error' | 'success' | 'info'
}

type NotificationContextValue = {
  notifications: Notification[]
  addNotification: (message: string, type?: Notification['type']) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

let nextId = 0
function generateId() {
  return `notif-${++nextId}-${Date.now()}`
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (message: string, type: Notification['type'] = 'error') => {
      const id = generateId()
      setNotifications((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 5000)
    },
    [],
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <div className="notification-toast-container" aria-live="polite">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-toast notification-toast--${n.type}`}
            role="alert"
          >
            <span>{n.message}</span>
            <button
              type="button"
              className="notification-toast__dismiss"
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return ctx
}
