'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { signIn, confirmSignIn } from 'aws-amplify/auth'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Shield, ArrowLeft, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // New-password-required challenge state
  const [needsNewPassword, setNeedsNewPassword] = useState(false)
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [showNew, setShowNew]                   = useState(false)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password })

      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNeedsNewPassword(true)
        setLoading(false)
        return
      }

      if (isSignedIn) {
        const role = await login(email, password)
        if (role) router.push('/dashboard')
        else setError('Account not configured. Contact your system administrator.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed.'
      setError(msg)
    }

    setLoading(false)
  }

  async function handleNewPassword(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await confirmSignIn({ challengeResponse: newPassword })
      const role = await login(email, newPassword)
      if (role) router.push('/dashboard')
      else setError('Account not configured. Contact your system administrator.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set new password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Brand */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/logo.png" alt="DICT Logo" width={56} height={56} className="mb-3" />
        <p className="text-[10px] font-semibold text-blue-700 tracking-widest uppercase mb-1">
          Government of Papua New Guinea
        </p>
        <h1 className="text-lg font-black text-gray-900 text-center">
          Dept. of Information Communication &amp; Technology
        </h1>
        <p className="text-xs text-gray-400 mt-1">M&amp;E Dashboard — Secure Sign In</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="h-1 bg-blue-700" />

          <div className="p-7">
            {!needsNewPassword ? (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-blue-700" />
                  <p className="text-sm font-bold text-gray-900">Sign In</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@dict.gov.pg"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
                        className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2.5">
                      <Shield className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors"
                  >
                    {loading ? 'Signing in…' : 'Sign In to Dashboard'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-900 mb-1">Set New Password</p>
                  <p className="text-xs text-gray-500">Your account requires a new password before you can sign in.</p>
                </div>

                <form onSubmit={handleNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Min 8 chars, upper, lower, number, symbol"
                        className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2.5">
                      <Shield className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded text-sm hover:bg-blue-800 disabled:opacity-60 transition-colors"
                  >
                    {loading ? 'Setting password…' : 'Set Password & Sign In'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link href="/"
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-gray-400 text-center">
          Authorised DICT personnel only · Protected by GoPNG ICT Security Policy
        </p>
        <p className="mt-1 text-xs text-gray-400 text-center">
          Contact your system administrator to create or reset your account.
        </p>
      </div>
    </div>
  )
}
