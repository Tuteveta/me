'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '@/amplify/data/resource'
import type { ManagedUser, UserRole } from '@/types'
import {
  UserPlus, Search, MoreVertical, CheckCircle, XCircle, X,
  RefreshCw, Pencil, Trash2, Building2, AlertTriangle,
} from 'lucide-react'
import { DICT_DIVISIONS } from '@/lib/org-data'

const client = generateClient<Schema>()

function uid() { return Math.random().toString(36).slice(2, 9) }

const ROLE_BADGE: Record<string, string> = {
  super:     'bg-red-100 text-red-700',
  admin:     'bg-amber-100 text-amber-700',
  executive: 'bg-purple-100 text-purple-700',
  deputy:    'bg-indigo-100 text-indigo-700',
  finance:   'bg-emerald-100 text-emerald-700',
  dcs:       'bg-teal-100 text-teal-700',
  officer:   'bg-gray-100 text-gray-700',
}

const ROLE_LABEL: Record<string, string> = {
  super:     'System',
  admin:     'Manager',
  executive: 'Executive',
  deputy:    'Deputy',
  dcs:       'Director',
  finance:   'Secretary',
  officer:   'Officer',
}

/* ── Add User Modal ─────────────────────────────────────────────────────────── */
function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: ManagedUser) => Promise<void> }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState<UserRole>('admin')
  const [division, setDivision] = useState(DICT_DIVISIONS[0])
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)

  const inputCls = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[11px] font-semibold text-gray-600 mb-1'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim())  { setError('Name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return }
    setSaving(true)
    await onAdd({ id: uid(), name: name.trim(), email: email.trim().toLowerCase(), role, division, status: 'active', createdAt: new Date().toISOString().split('T')[0] })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Add New User</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Create a new system account</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="e.g. Jane Doe" value={name} onChange={e => { setName(e.target.value); setError('') }} />
            </div>
            <div>
              <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
              <input type="email" className={inputCls} placeholder="user@dict.gov.pg" value={email} onChange={e => { setEmail(e.target.value); setError('') }} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Role</label>
              <select className={inputCls} value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="admin">Manager</option>
                <option value="executive">Executive</option>
                <option value="deputy">Deputy</option>
                <option value="dcs">Director</option>
                <option value="finance">Secretary</option>
                <option value="officer">Officer</option>
                <option value="super">System</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Division / Wing</label>
              <select className={inputCls} value={division} onChange={e => setDivision(e.target.value)}>
                {DICT_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-[11px] text-gray-500">
            {role === 'super'     && <><span className="font-bold text-red-700">System:</span> Full system access including user management and audit logs.</>}
            {role === 'admin'     && <><span className="font-bold text-amber-700">Manager:</span> Submits requests, manages workplans, projects, KPIs, and reports.</>}
            {role === 'executive' && <><span className="font-bold text-purple-700">Executive:</span> First-level approval of requests.</>}
            {role === 'deputy'    && <><span className="font-bold text-indigo-700">Deputy:</span> Second-level endorsement before Secretary approval.</>}
            {role === 'finance'   && <><span className="font-bold text-emerald-700">Secretary:</span> Reviews and approves programme funding; receives acquittal reports.</>}
            {role === 'dcs'       && <><span className="font-bold text-teal-700">Director:</span> Reviews requests endorsed by Deputy before Secretary allocation.</>}
            {role === 'officer'   && <><span className="font-bold text-gray-700">Officer:</span> Receives tasks and submits requests.</>}
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-60 transition-colors">
              <UserPlus className="w-3.5 h-3.5" /> {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Edit / Move User Modal ──────────────────────────────────────────────────── */
function EditUserModal({ user: u, onClose, onSave }: {
  user: ManagedUser
  onClose: () => void
  onSave: (id: string, updates: { role: UserRole; division: string }) => Promise<void>
}) {
  const [role, setRole]         = useState<UserRole>(u.role)
  const [division, setDivision] = useState(u.division)
  const [saving, setSaving]     = useState(false)

  const inputCls = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[11px] font-semibold text-gray-600 mb-1'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(u.id, { role, division })
    setSaving(false)
    onClose()
  }

  const changed = role !== u.role || division !== u.division

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Edit User</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{u.name} · {u.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Current state */}
          <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2.5 flex items-center gap-3 text-xs text-gray-500">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span>Currently: <span className="font-semibold text-gray-700">{ROLE_LABEL[u.role] ?? u.role}</span> · <span className="font-semibold text-gray-700">{u.division}</span></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Role</label>
              <select className={inputCls} value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="admin">Manager</option>
                <option value="executive">Executive</option>
                <option value="deputy">Deputy</option>
                <option value="dcs">Director</option>
                <option value="finance">Secretary</option>
                <option value="officer">Officer</option>
                <option value="super">System</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Division / Wing</label>
              <select className={inputCls} value={division} onChange={e => setDivision(e.target.value)}>
                {DICT_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {changed && (
            <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-[11px] text-blue-700">
              <span className="font-semibold">Changes to apply:</span>{' '}
              {role !== u.role && <span>Role → <strong>{ROLE_LABEL[role] ?? role}</strong>{division !== u.division ? ' · ' : ''}</span>}
              {division !== u.division && <span>Division → <strong>{division}</strong></span>}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving || !changed} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-60 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete Confirm Modal ───────────────────────────────────────────────────── */
function DeleteModal({ user: u, onClose, onConfirm }: {
  user: ManagedUser
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  async function handle() {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-sm shadow-lg">
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Remove User</h2>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-gray-800">{u.name}</span> ({u.email}) from the system? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handle} disabled={deleting} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Removing…' : 'Remove User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Row action menu ─────────────────────────────────────────────────────────── */
function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded shadow-lg w-44 py-1">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-500" />
            Edit / Move Division
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove User
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function UsersPage() {
  const { user } = useAuth()
  if (user && user.role !== 'super') redirect('/dashboard')

  const [users, setUsers]           = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading]   = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState<ManagedUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null)

  async function loadUsers() {
    setIsLoading(true)
    try {
      const { data: items } = await (client.models as any).ManagedUser.list()
      const mapped: ManagedUser[] = (items ?? []).map((u: any) => ({
        id:        u.id,
        name:      u.name,
        email:     u.email,
        role:      u.role as UserRole,
        division:  u.division,
        status:    u.status as 'active' | 'inactive',
        lastLogin: u.lastLogin,
        createdAt: (u.createdAt ?? '').slice(0, 10),
      }))
      setUsers(mapped)
    } catch { /* AppSync unavailable */ } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function handleAdd(u: ManagedUser) {
    try {
      await (client.models as any).ManagedUser.create({ name: u.name, email: u.email, role: u.role, division: u.division, status: 'active' })
    } catch { /* best-effort */ }
    await loadUsers()
  }

  async function handleEdit(id: string, updates: { role: UserRole; division: string }) {
    try {
      await (client.models as any).ManagedUser.update({ id, ...updates })
    } catch { /* best-effort */ }
    await loadUsers()
  }

  async function handleDelete(id: string) {
    try {
      await (client.models as any).ManagedUser.delete({ id })
    } catch { /* best-effort */ }
    await loadUsers()
  }

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.division.toLowerCase().includes(search.toLowerCase())
    )

  function relativeTime(iso?: string) {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    const h = Math.floor(diff / 3_600_000)
    const d = Math.floor(diff / 86_400_000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    return `${d}d ago`
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {editTarget && <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} />}
      {deleteTarget && <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => handleDelete(deleteTarget.id)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {users.filter(u => u.status === 'active').length} active · {users.length} total users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers} disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors">
            <UserPlus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded pl-9 pr-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'super', 'admin', 'executive', 'deputy', 'dcs', 'finance', 'officer'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                roleFilter === r ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {r === 'all'       ? `All (${users.length})` :
               r === 'super'     ? `System (${users.filter(u => u.role === r).length})` :
               r === 'admin'     ? `Manager (${users.filter(u => u.role === r).length})` :
               r === 'executive' ? `Executive (${users.filter(u => u.role === r).length})` :
               r === 'deputy'    ? `Deputy (${users.filter(u => u.role === r).length})` :
               r === 'dcs'       ? `Director (${users.filter(u => u.role === r).length})` :
               r === 'finance'   ? `Secretary (${users.filter(u => u.role === r).length})` :
                                   `Officer (${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-160">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">User</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Division / Wing</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Role</th>
                <th className="text-center px-4 py-3 text-gray-500 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden sm:table-cell">Last Login</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden lg:table-cell">Created</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: ManagedUser) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Building2 className="w-3 h-3 text-gray-300 shrink-0" />
                      <span className="truncate">{u.division}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.status === 'active'
                      ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">{relativeTime(u.lastLogin)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <RowMenu
                      onEdit={() => setEditTarget(u)}
                      onDelete={() => setDeleteTarget(u)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="py-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading users…</p>
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No users match your search.</div>
        )}
      </div>

      {/* Role legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
        <p className="text-xs font-semibold text-blue-800 mb-2">Role Access Levels</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { color: 'text-red-700',     label: 'System',    desc: 'Full system access including user management, settings, and audit logs.' },
            { color: 'text-amber-700',   label: 'Manager',   desc: 'Submits requests, manages workplans, projects, KPIs, and reports.' },
            { color: 'text-purple-700',  label: 'Executive', desc: 'First-level approval of requests.' },
            { color: 'text-indigo-700',  label: 'Deputy',    desc: 'Second-level endorsement of requests before Secretary approval.' },
            { color: 'text-teal-700',    label: 'Director',  desc: 'Reviews requests endorsed by Deputy before Secretary allocation.' },
            { color: 'text-emerald-700', label: 'Secretary', desc: 'Approves funding based on availability; receives acquittal reports.' },
            { color: 'text-gray-700',    label: 'Officer',   desc: 'Receives tasks and submits requests.' },
          ].map(r => (
            <div key={r.label}>
              <span className={`font-bold ${r.color}`}>{r.label}</span>
              <p className="text-[11px] text-gray-500 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
