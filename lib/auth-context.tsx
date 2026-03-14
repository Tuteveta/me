'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'super' | 'admin' | 'finance' | 'executive' | 'deputy' | 'dcs'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  division: string
  avatar?: string
  lastLogin?: string
}

interface ProfileUpdate {
  name: string
  email: string
  division: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<UserRole | null>
  logout: () => void
  updateProfile: (data: ProfileUpdate) => void
  changePassword: (currentPassword: string, newPassword: string) => boolean
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
    id: '4',
    name: 'Grace Temu',
    email: 'finance@dict.gov.pg',
    password: 'dict@2025',
    role: 'finance',
    division: 'Finance Division',
  },
  {
    id: '5',
    name: 'David Arua',
    email: 'executive@dict.gov.pg',
    password: 'dict@2025',
    role: 'executive',
    division: 'Executive Office',
  },
  {
    id: '6',
    name: 'Ruth Kanawi',
    email: 'deputy@dict.gov.pg',
    password: 'dict@2025',
    role: 'deputy',
    division: "Deputy Secretary's Office",
  },
  {
    id: '7',
    name: 'Peter Undi',
    email: 'dcs@dict.gov.pg',
    password: 'dict@2025',
    role: 'dcs',
    division: 'Corporate Services Division',
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

  const login = async (email: string, password: string): Promise<UserRole | null> => {
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return null
    const { password: _, ...u } = found
    const authed = { ...u, lastLogin: new Date().toISOString() }
    setUser(authed)
    localStorage.setItem('dict_me_user', JSON.stringify(authed))
    return authed.role
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('dict_me_user')
  }

  const updateProfile = (data: ProfileUpdate) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('dict_me_user', JSON.stringify(updated))
  }

  const changePassword = (currentPassword: string, _newPassword: string): boolean => {
    if (!user) return false
    const found = MOCK_USERS.find(u => u.id === user.id && u.password === currentPassword)
    if (!found) return false
    // Password update persists in-session only until backend integration
    found.password = _newPassword
    return true
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
