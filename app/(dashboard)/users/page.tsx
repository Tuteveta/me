'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { MANAGED_USERS } from '@/lib/mock-data/me-data'
import type { ManagedUser, UserRole } from '@/types'
import { UserPlus, Search, MoreVertical, CheckCircle, XCircle, X } from 'lucide-react'

const DIVISIONS = [
  'ICT Infrastructure',
  'M&E Division',
  'Digital Services',
  'Policy & Planning',
  'Cybersecurity',
  'eGovernment Services',
  'Capacity Building',
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: ManagedUser) => void }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [role, setRole]         = useState<UserRole>('admin')
  const [division, setDivision] = useState(DIVISIONS[0])
  const [error, setError]       = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim())  { setError('Name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return }

    onAdd({
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      division,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    })
    onClose()
  }

  const inputCls = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[11px] font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md shadow-lg">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Add New User</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Create a new system account</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}

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
                <option value="admin">M&E Manager</option>
                <option value="executive">Executive Manager</option>
                <option value="deputy">Deputy Secretary</option>
                <option value="dcs">Dir. Corporate Services</option>
                <option value="finance">Finance Manager</option>
                <option value="super">Super Admin</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Division</label>
              <select className={inputCls} value={division} onChange={e => setDivision(e.target.value)}>
                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Role hint */}
          <div className="bg-gray-50 border border-gray-100 rounded px-3 py-2 text-[11px] text-gray-500">
            {role === 'super'     && <><span className="font-bold text-red-700">Super Admin:</span> Full system access including user management and audit logs.</>}
            {role === 'admin'     && <><span className="font-bold text-amber-700">M&E Manager:</span> Project management, KPI oversight, workplans, and funding requests.</>}
            {role === 'executive' && <><span className="font-bold text-purple-700">Executive Manager:</span> First-level approval of M&E funding requests.</>}
            {role === 'deputy'    && <><span className="font-bold text-indigo-700">Deputy Secretary:</span> Second-level endorsement before Finance approval.</>}
            {role === 'finance'   && <><span className="font-bold text-emerald-700">Finance Manager:</span> Reviews and approves programme funding; receives acquittal reports.</>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors">
              <UserPlus className="w-3.5 h-3.5" /> Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ROLE_BADGE: Record<string, string> = {
  super:     'bg-red-100 text-red-700',
  admin:     'bg-amber-100 text-amber-700',
  executive: 'bg-purple-100 text-purple-700',
  deputy:    'bg-indigo-100 text-indigo-700',
  finance:   'bg-emerald-100 text-emerald-700',
  dcs:       'bg-teal-100 text-teal-700',
}

export default function UsersPage() {
  const { user } = useAuth()

  if (user && user.role !== 'super') {
    redirect('/dashboard')
  }

  const [users, setUsers]         = useState<ManagedUser[]>(MANAGED_USERS)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [showModal, setShowModal] = useState(false)

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

      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onAdd={u => setUsers(prev => [u, ...prev])}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {users.filter(u => u.status === 'active').length} active · {users.length} total users
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded pl-9 pr-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'super', 'admin', 'executive', 'deputy', 'dcs', 'finance'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {r === 'all' ? `All (${users.length})` :
               r === 'admin' ? `M&E Mgr (${users.filter(u => u.role === r).length})` :
               r === 'executive' ? `Exec. Mgr (${users.filter(u => u.role === r).length})` :
               r === 'deputy' ? `Deputy Sec. (${users.filter(u => u.role === r).length})` :
               r === 'dcs' ? `Dir. Corp. (${users.filter(u => u.role === r).length})` :
               r === 'finance' ? `Finance (${users.filter(u => u.role === r).length})` :
               `${r.charAt(0).toUpperCase() + r.slice(1)} (${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-150">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">User</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold hidden md:table-cell">Division</th>
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
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                        <p className="text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden md:table-cell">{u.division}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${ROLE_BADGE[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden sm:table-cell">{relativeTime(u.lastLogin)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No users match your search.</div>
        )}
      </div>

      {/* Role legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
        <p className="text-xs font-semibold text-blue-800 mb-2">Role Access Levels</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="font-bold text-red-700">Super Admin</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Full system access including user management, settings, and audit logs.</p>
          </div>
          <div>
            <span className="font-bold text-amber-700">M&E Manager</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Submits funding requests, manages workplans, projects, KPIs, and reports.</p>
          </div>
          <div>
            <span className="font-bold text-purple-700">Executive Manager</span>
            <p className="text-[11px] text-gray-500 mt-0.5">First-level approval of funding requests from the M&E Manager.</p>
          </div>
          <div>
            <span className="font-bold text-indigo-700">Deputy Secretary</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Second-level endorsement of requests before Finance approval.</p>
          </div>
          <div>
            <span className="font-bold text-emerald-700">Finance Manager</span>
            <p className="text-[11px] text-gray-500 mt-0.5">Approves funding based on availability; receives acquittal reports.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
