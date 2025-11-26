"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useAuth } from "./AuthContext"
import { fetchNotifications } from "@/api/notification"
import type { Notification } from "@/types/notification"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  readIds: Set<string>
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Intervalo de polling en milisegundos (30 segundos por defecto)
const POLLING_INTERVAL = 30000

// Claves para localStorage
const getNotificationsKey = (userId: string) => `notifications_${userId}`
const getReadIdsKey = (userId: string) => `notifications_read_${userId}`

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

const clearNotificationsFromStorage = (userId: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(getNotificationsKey(userId))
    localStorage.removeItem(getReadIdsKey(userId))
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
      
      // Agregar nuevas notificaciones a las existentes (no reemplazar)
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id))
        const uniqueNew = newNotifications.filter((n) => !existingIds.has(n.id))
        const updated = [...prev, ...uniqueNew].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        // Persistir en localStorage
        if (user?.id) {
          saveNotificationsToStorage(user.id, updated)
        }
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

  const clearAll = useCallback(() => {
    setNotifications([])
    setReadIds(new Set())
    if (user?.id) {
      clearNotificationsFromStorage(user.id)
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
      setLastUserId(null)
      return
    }

    // Si es un nuevo usuario o primera carga, cargar del localStorage
    if (lastUserId !== user.id) {
      const storedNotifications = loadNotificationsFromStorage(user.id)
      const storedReadIds = loadReadIdsFromStorage(user.id)
      setNotifications(storedNotifications)
      setReadIds(storedReadIds)
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
    refreshNotifications,
    markAsRead,
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

