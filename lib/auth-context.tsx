'use client'

import '@/lib/amplify'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  signIn, signOut, getCurrentUser, fetchUserAttributes,
  updateUserAttributes, updatePassword,
} from 'aws-amplify/auth'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'

const dataClient = generateClient<Schema>()

export type UserRole = 'super' | 'admin' | 'finance' | 'executive' | 'deputy' | 'dcs' | 'officer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  division: string
  lastLogin?: string
}

interface ProfileUpdate { name: string; email: string; division: string }

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<UserRole | null>
  logout: () => void
  updateProfile: (data: ProfileUpdate) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

async function upsertManagedUser(user: User): Promise<void> {
  try {
    const models = (dataClient.models as any)
    const { data: existing } = await models.ManagedUser.list({
      filter: { email: { eq: user.email } },
    })
    const now = new Date().toISOString().slice(0, 10)
    if (existing && existing.length > 0) {
      await models.ManagedUser.update({
        id: existing[0].id,
        name: user.name,
        role: user.role,
        division: user.division || 'Unassigned',
        status: 'active',
        lastLogin: now,
      })
    } else {
      await models.ManagedUser.create({
        name: user.name,
        email: user.email,
        role: user.role,
        division: user.division || 'Unassigned',
        status: 'active',
        lastLogin: now,
      })
    }
  } catch {
    // Non-critical — don't block login if sync fails
  }
}

async function loadCurrentUser(): Promise<User | null> {
  try {
    const { userId, username } = await getCurrentUser()
    const attrs = await fetchUserAttributes()
    const user: User = {
      id: userId,
      name: attrs.name ?? username,
      email: attrs.email ?? username,
      role: (attrs['custom:role'] as UserRole) ?? 'admin',
      division: attrs['custom:division'] ?? '',
      lastLogin: new Date().toISOString(),
    }
    // Sync this user's info into DynamoDB so the super admin dashboard can see them
    upsertManagedUser(user)
    return user
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCurrentUser().then(u => {
      setUser(u)
      setIsLoading(false)
    })
  }, [])

  const login = async (_email: string, _password: string): Promise<UserRole | null> => {
    const u = await loadCurrentUser()
    setUser(u)
    return u?.role ?? null
  }

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  const updateProfile = async (data: ProfileUpdate) => {
    await updateUserAttributes({
      userAttributes: {
        name: data.name,
        email: data.email,
        'custom:division': data.division,
      },
    })
    setUser(prev => prev ? { ...prev, ...data } : prev)
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await updatePassword({ oldPassword: currentPassword, newPassword })
      return true
    } catch {
      return false
    }
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
