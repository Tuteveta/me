'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { User, Mail, Building2, Lock, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  super:     'Super Admin',
  admin:     'M&E Manager',
  finance:   'Finance Manager',
  executive: 'Executive Manager',
  deputy:    'Deputy Secretary',
}

const ROLE_COLORS: Record<string, string> = {
  super:     'bg-red-100 text-red-700',
  admin:     'bg-amber-100 text-amber-700',
  finance:   'bg-emerald-100 text-emerald-700',
  executive: 'bg-purple-100 text-purple-700',
  deputy:    'bg-indigo-100 text-indigo-700',
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth()
  if (!user) return null

  const [profile, setProfile] = useState({ name: user.name, email: user.email, division: user.division })
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    if (!profile.name.trim() || !profile.email.trim() || !profile.division.trim()) {
      setProfileError('All fields are required.')
      return
    }
    updateProfile({ name: profile.name.trim(), email: profile.email.trim(), division: profile.division.trim() })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)
    if (pw.next.length < 8) {
      setPwError('New password must be at least 8 characters.')
      return
    }
    if (pw.next !== pw.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    const ok = changePassword(pw.current, pw.next)
    if (!ok) {
      setPwError('Current password is incorrect.')
      return
    }
    setPw({ current: '', next: '', confirm: '' })
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 3000)
  }

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and password</p>
      </div>

      {/* Avatar + role card */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl font-black shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
            <span className="text-xs text-gray-400">{user.division}</span>
          </div>
        </div>
      </div>

      {/* Personal information */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-700">Personal Information</h2>
        </div>
        <form onSubmit={handleProfileSave} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</span>
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address</span>
              </label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Division</span>
              </label>
              <input
                type="text"
                required
                value={profile.division}
                onChange={e => setProfile(p => ({ ...p, division: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role</label>
              <input
                readOnly
                value={ROLE_LABELS[user.role] ?? user.role}
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-default"
              />
            </div>
          </div>

          {profileError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{profileError}</p>
            </div>
          )}
          {profileSaved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <p className="text-xs text-green-700">Profile updated successfully.</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-blue-800 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-700">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          {[
            { key: 'current' as const, label: 'Current Password' },
            { key: 'next'    as const, label: 'New Password' },
            { key: 'confirm' as const, label: 'Confirm New Password' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{field.label}</label>
              <div className="relative">
                <input
                  type={showPw[field.key] ? 'text' : 'password'}
                  required
                  value={pw[field.key]}
                  onChange={e => setPw(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => ({ ...p, [field.key]: !p[field.key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{pwError}</p>
            </div>
          )}
          {pwSaved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <p className="text-xs text-green-700">Password changed successfully.</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gray-800 text-white text-sm font-semibold px-5 py-2 rounded hover:bg-gray-900 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Update Password
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
