'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Eye, EyeOff, Shield, ChevronRight, ArrowLeft } from 'lucide-react'

const MOCK_USERS = [
  {
    name: 'John Vele',
    role: 'Super',
    division: 'ICT Infrastructure',
    email: 'super@dict.gov.pg',
    password: 'dict@2025',
    roleColor: '#CE1126',
    roleBg: '#CE112615',
    desc: 'Full system access — users, settings, all modules',
    initials: 'JV',
    avatarBg: '#1D4ED8',
  },
  {
    name: 'Mary Kila',
    role: 'Admin',
    division: 'M&E Division',
    email: 'admin@dict.gov.pg',
    password: 'dict@2025',
    roleColor: '#D97706',
    roleBg: '#D9770615',
    desc: 'Project management, reports, KPI oversight',
    initials: 'MK',
    avatarBg: '#7C3AED',
  },
  {
    name: 'Peter Namaliu',
    role: 'Officer',
    division: 'Digital Services',
    email: 'officer@dict.gov.pg',
    password: 'dict@2025',
    roleColor: '#3B82F6',
    roleBg: '#3B82F615',
    desc: 'View dashboards, submit reports, track KPIs',
    initials: 'PN',
    avatarBg: '#059669',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password. Please try again.')
    }
  }

  function selectUser(i: number) {
    const u = MOCK_USERS[i]
    setSelected(i)
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">

      {/* Header text */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-semibold text-blue-700 tracking-widest uppercase mb-1">
          Government of Papua New Guinea
        </p>
        <h1 className="text-lg font-black text-gray-900">
          Dept. of Information Communication &amp; Technology
        </h1>
        <p className="text-xs text-gray-400 mt-1">M&amp;E Dashboard — Secure Sign In</p>
      </div>

      <div className="w-full max-w-2xl flex flex-col lg:flex-row gap-4">

        {/* ── Left: Mock user cards ─────────────────────────────────────── */}
        <div className="lg:w-72 flex-shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-1">
            Demo Accounts
          </p>
          <div className="space-y-2">
            {MOCK_USERS.map((u, i) => (
              <button
                key={u.email}
                type="button"
                onClick={() => selectUser(i)}
                className={`
                  w-full text-left bg-white border rounded-lg px-4 py-3.5 transition-all
                  ${selected === i
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                    style={{ background: u.avatarBg }}
                  >
                    {u.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{u.name}</span>
                      <span
                        className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ color: u.roleColor, background: u.roleBg }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{u.division}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{u.desc}</p>
                  </div>

                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${selected === i ? 'text-blue-500' : 'text-gray-300'}`} />
                </div>

                {/* Email row */}
                <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">{u.email}</span>
                  <span className="text-[10px] font-mono text-gray-300">dict@2025</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Login form ─────────────────────────────────────────── */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
            <div className="h-1 bg-blue-700" />
            <div className="p-7">

              {/* Selected user indicator */}
              {selected !== null && (
                <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded px-3 py-2.5 mb-5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                    style={{ background: MOCK_USERS[selected].avatarBg }}
                  >
                    {MOCK_USERS[selected].initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-blue-900">{MOCK_USERS[selected].name}</p>
                    <p className="text-[10px] text-blue-600">{MOCK_USERS[selected].division}</p>
                  </div>
                  <span
                    className="ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: MOCK_USERS[selected].roleColor, background: MOCK_USERS[selected].roleBg }}
                  >
                    {MOCK_USERS[selected].role}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setSelected(null) }}
                    placeholder="you@dict.gov.pg"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2.5">
                    <Shield className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded text-sm
                    hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                </button>
              </form>

              <p className="text-[10px] text-gray-400 text-center mt-6">
                Select a demo account on the left, or enter credentials manually.
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Authorised DICT personnel only · Protected by GoPNG ICT Security Policy
      </p>
    </div>
  )
}
