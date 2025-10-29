"use client"

import { fetchUserByEmail } from "@/api/user"
import { Usuario } from "@/types/user"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface AuthContextType {
  user: Usuario | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar si hay una sesión guardada al cargar la página
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      if (email && password) {
        var user = await fetchUserByEmail(email)
        
        if (!user) {
          setIsLoading(false)
          return false
        }
        
        if (user.password !== password) {
          setIsLoading(false)
          return false
        }

        setUser(user)
        localStorage.setItem('user', JSON.stringify(user))
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Error en login:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
