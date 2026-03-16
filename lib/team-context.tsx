'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Officer, Task, TaskStatus, UserRole } from '@/types'

const OFFICERS_KEY = 'dict_me_officers'
const TASKS_KEY    = 'dict_me_tasks'

function save<T>(key: string, data: T[]) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch { return [] }
}

interface TeamContextType {
  officers: Officer[]
  tasks: Task[]
  addOfficer:    (o: Officer) => void
  updateOfficer: (o: Officer) => void
  removeOfficer: (id: string) => void
  addTask:    (t: Task) => void
  updateTask: (t: Task) => void
  deleteTask: (id: string) => void
  // Officer calls this to report progress / notes
  updateTaskProgress: (id: string, progress: number, status: TaskStatus, notes?: string) => void
  // Helpers scoped to a manager
  officersByManager:  (managerName: string) => Officer[]
  tasksByManager:     (managerName: string) => Task[]
  // Helpers scoped to an officer
  tasksByOfficer:     (officerId: string) => Task[]
}

const TeamContext = createContext<TeamContextType | null>(null)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [tasks,    setTasks]    = useState<Task[]>([])

  useEffect(() => {
    setOfficers(load<Officer>(OFFICERS_KEY))
    setTasks(load<Task>(TASKS_KEY))
  }, [])

  /* ── Officers ── */
  function addOfficer(o: Officer) {
    setOfficers(prev => { const next = [o, ...prev]; save(OFFICERS_KEY, next); return next })
  }
  function updateOfficer(o: Officer) {
    setOfficers(prev => { const next = prev.map(x => x.id === o.id ? o : x); save(OFFICERS_KEY, next); return next })
  }
  function removeOfficer(id: string) {
    setOfficers(prev => { const next = prev.filter(x => x.id !== id); save(OFFICERS_KEY, next); return next })
    // Cascade: remove their tasks too
    setTasks(prev => { const next = prev.filter(t => t.assignedTo !== id); save(TASKS_KEY, next); return next })
  }

  /* ── Tasks ── */
  function addTask(t: Task) {
    setTasks(prev => { const next = [t, ...prev]; save(TASKS_KEY, next); return next })
  }
  function updateTask(t: Task) {
    setTasks(prev => { const next = prev.map(x => x.id === t.id ? t : x); save(TASKS_KEY, next); return next })
  }
  function deleteTask(id: string) {
    setTasks(prev => { const next = prev.filter(x => x.id !== id); save(TASKS_KEY, next); return next })
  }
  function updateTaskProgress(id: string, progress: number, status: TaskStatus, notes?: string) {
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id !== id) return t
        const completedAt = status === 'completed' ? new Date().toISOString().slice(0, 10) : t.completedAt
        return { ...t, progress, status, completedAt, ...(notes !== undefined ? { notes } : {}) }
      })
      save(TASKS_KEY, next)
      return next
    })
  }

  /* ── Scoped helpers ── */
  function officersByManager(managerName: string) {
    return officers.filter(o => o.createdBy === managerName)
  }
  function tasksByManager(managerName: string) {
    return tasks.filter(t => t.assignedBy === managerName)
  }
  function tasksByOfficer(officerId: string) {
    return tasks.filter(t => t.assignedTo === officerId)
  }

  return (
    <TeamContext.Provider value={{
      officers, tasks,
      addOfficer, updateOfficer, removeOfficer,
      addTask, updateTask, deleteTask, updateTaskProgress,
      officersByManager, tasksByManager, tasksByOfficer,
    }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
