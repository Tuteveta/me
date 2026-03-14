'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'super' | 'admin' | 'officer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  division: string
  avatar?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'John Vele',
    email: 'super@dict.gov.pg',
    password: 'dict@2025',
    role: 'super',
    division: 'ICT Infrastructure',
  },
  {
    id: '2',
    name: 'Mary Kila',
    email: 'admin@dict.gov.pg',
    password: 'dict@2025',
    role: 'admin',
    division: 'M&E Division',
  },
  {
    id: '3',
    name: 'Peter Namaliu',
    email: 'officer@dict.gov.pg',
    password: 'dict@2025',
    role: 'officer',
    division: 'Digital Services',
  },
]

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dict_me_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('dict_me_user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return false
    const { password: _, ...u } = found
    const authed = { ...u, lastLogin: new Date().toISOString() }
    setUser(authed)
    localStorage.setItem('dict_me_user', JSON.stringify(authed))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dict_me_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
