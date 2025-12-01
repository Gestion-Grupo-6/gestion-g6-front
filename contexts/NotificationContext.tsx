"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { fetchNotifications, markAllAsRead } from "@/api/notification"
import type { Notification } from "@/types/notification"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  readIds: Set<string>
  hiddenIds: Set<string>
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => void
  hideNotification: (notificationId: string) => void
  clearAll: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Intervalo de polling en milisegundos (30 segundos por defecto)
const POLLING_INTERVAL = 30000

// Claves para localStorage
const getNotificationsKey = (userId: string) => `notifications_${userId}`
const getReadIdsKey = (userId: string) => `notifications_read_${userId}`
const getHiddenIdsKey = (userId: string) => `notifications_hidden_${userId}`

// Helpers para localStorage
const saveNotificationsToStorage = (userId: string, notifications: Notification[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getNotificationsKey(userId), JSON.stringify(notifications))
  } catch (error) {
    console.error("Error guardando notificaciones en localStorage:", error)
  }
}

const loadNotificationsFromStorage = (userId: string): Notification[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(getNotificationsKey(userId))
    if (stored) {
      return JSON.parse(stored) as Notification[]
    }
  } catch (error) {
    console.error("Error cargando notificaciones de localStorage:", error)
  }
  return []
}

const saveReadIdsToStorage = (userId: string, readIds: Set<string>) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getReadIdsKey(userId), JSON.stringify(Array.from(readIds)))
  } catch (error) {
    console.error("Error guardando readIds en localStorage:", error)
  }
}

const loadReadIdsFromStorage = (userId: string): Set<string> => {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(getReadIdsKey(userId))
    if (stored) {
      return new Set(JSON.parse(stored) as string[])
    }
  } catch (error) {
    console.error("Error cargando readIds de localStorage:", error)
  }
  return new Set()
}

const saveHiddenIdsToStorage = (userId: string, hiddenIds: Set<string>) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getHiddenIdsKey(userId), JSON.stringify(Array.from(hiddenIds)))
  } catch (error) {
    console.error("Error guardando hiddenIds en localStorage:", error)
  }
}

const loadHiddenIdsFromStorage = (userId: string): Set<string> => {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(getHiddenIdsKey(userId))
    if (stored) {
      return new Set(JSON.parse(stored) as string[])
    }
  } catch (error) {
    console.error("Error cargando hiddenIds de localStorage:", error)
  }
  return new Set()
}

const clearNotificationsFromStorage = (userId: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(getNotificationsKey(userId))
    localStorage.removeItem(getReadIdsKey(userId))
    localStorage.removeItem(getHiddenIdsKey(userId))
  } catch (error) {
    console.error("Error limpiando notificaciones de localStorage:", error)
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [lastUserId, setLastUserId] = useState<string | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const newNotifications = await fetchNotifications(user.id)
      
      // Actualizar notificaciones existentes y agregar nuevas
      setNotifications((prev) => {
        const existingMap = new Map(prev.map((n) => [n.id, n]))
        
        // Actualizar notificaciones existentes con datos del backend
        newNotifications.forEach((newNotif) => {
          existingMap.set(newNotif.id, newNotif)
        })
        
        // Filtrar notificaciones ocultas (showed: true) y ordenar
        // Nota: hiddenIds se filtra en hideNotificationById
        const updated = Array.from(existingMap.values())
          .filter((n) => !n.showed)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        // Filtrar también por hiddenIds usando el estado actual
        // Necesitamos hacer esto de manera síncrona, así que usamos una función de actualización
        return updated
      })
    } catch (e: any) {
      // Solo loguear errores de red, no romper el polling
      if (e?.message?.includes("Failed to fetch") || e?.message?.includes("NetworkError")) {
        // Error de red - probablemente el backend no está disponible
        // No establecer error para no mostrar mensaje al usuario
        console.debug("Backend no disponible para notificaciones")
      } else {
        console.error("Error al cargar notificaciones:", e)
        setError(e?.message || "Error al cargar notificaciones")
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id])
  
  // Filtrar notificaciones cuando cambia hiddenIds
  useEffect(() => {
    if (!user?.id) return
    
    setNotifications((prev) => {
      const filtered = prev
        .filter((n) => !hiddenIds.has(n.id))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      if (user?.id) {
        saveNotificationsToStorage(user.id, filtered)
      }
      return filtered
    })
  }, [hiddenIds, user?.id])

  const refreshNotifications = useCallback(async () => {
    await loadNotifications()
  }, [loadNotifications])

  const markAsRead = useCallback((notificationId: string) => {
    setReadIds((prev) => {
      const newReadIds = new Set([...prev, notificationId])
      if (user?.id) {
        saveReadIdsToStorage(user.id, newReadIds)
      }
      return newReadIds
    })
  }, [user?.id])

  const hideNotificationById = useCallback((notificationId: string) => {
    if (!user?.id) return
    
    // Agregar a hiddenIds - el useEffect se encargará de filtrar las notificaciones
    setHiddenIds((prev) => {
      const newHiddenIds = new Set([...prev, notificationId])
      saveHiddenIdsToStorage(user.id, newHiddenIds)
      return newHiddenIds
    })
  }, [user?.id])

  const clearAll = useCallback(async () => {
    if (!user?.id) return
    
    try {
      // Marcar todas las notificaciones no leídas como leídas en el backend
      await markAllAsRead(user.id)
      
      // Limpiar estado local
      setNotifications([])
      setReadIds(new Set())
      setHiddenIds(new Set())
      clearNotificationsFromStorage(user.id)
    } catch (error) {
      console.error("Error al limpiar todas las notificaciones:", error)
      throw error
    }
  }, [user?.id])

  // Cargar notificaciones del localStorage al cambiar de usuario o autenticarse
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Si cambió el usuario o se deslogueó, limpiar estado
      if (lastUserId && lastUserId !== user?.id) {
        // Limpiar localStorage del usuario anterior si cambió
        clearNotificationsFromStorage(lastUserId)
      }
      setNotifications([])
      setReadIds(new Set())
      setHiddenIds(new Set())
      setLastUserId(null)
      return
    }

    // Si es un nuevo usuario o primera carga, cargar del localStorage
    if (lastUserId !== user.id) {
      const storedNotifications = loadNotificationsFromStorage(user.id)
      const storedReadIds = loadReadIdsFromStorage(user.id)
      const storedHiddenIds = loadHiddenIdsFromStorage(user.id)
      setNotifications(storedNotifications.filter((n) => !storedHiddenIds.has(n.id) && !n.showed))
      setReadIds(storedReadIds)
      setHiddenIds(storedHiddenIds)
      setLastUserId(user.id)
    }
  }, [isAuthenticated, user?.id, lastUserId])

  // Polling automático cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    // Cargar inmediatamente al autenticarse (después de cargar del localStorage)
    void loadNotifications()

    // Configurar polling
    const interval = setInterval(() => {
      void loadNotifications()
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, loadNotifications])

  // Limpiar notificaciones del localStorage al desloguearse
  useEffect(() => {
    if (!isAuthenticated && lastUserId) {
      // Limpiar localStorage cuando el usuario se desloguea
      clearNotificationsFromStorage(lastUserId)
      setLastUserId(null)
    }
  }, [isAuthenticated, lastUserId])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    readIds,
    hiddenIds,
    refreshNotifications,
    markAsRead,
    hideNotification: hideNotificationById,
    clearAll,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

