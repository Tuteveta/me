'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Bell, RefreshCw, Menu } from 'lucide-react'

const BREADCRUMBS: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: 'Overview' },
  '/projects':  { label: 'Projects & Programs' },
  '/kpi':       { label: 'KPI Monitoring' },
  '/reports':   { label: 'Reports' },
  '/settings':  { label: 'Settings' },
  '/workplan':  { label: 'Annual Workplan' },
  '/users':     { label: 'User Management' },
  '/requests':  { label: 'Funding Requests' },
  '/approvals': { label: 'Approvals' },
  '/finance':   { label: 'Finance' },
  '/profile':   { label: 'My Profile' },
}

function useNow() {
  // Static date for SSR compatibility — update client-side if needed
  return new Date().toLocaleString('en-PG', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Pacific/Port_Moresby',
  })
}

export default function TopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const crumb = BREADCRUMBS[pathname] ?? { label: 'Dashboard' }
  const now = useNow()

  return (
    <header className="h-[48px] bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-5 flex-shrink-0">

      {/* Left — hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onMenuOpen}
          className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-gray-400 text-xs hidden sm:inline">DICT M&amp;E</span>
        <span className="text-gray-300 hidden sm:inline">/</span>
        <span className="font-semibold text-gray-900 text-xs">{crumb.label}</span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* FY indicator */}
        <span className="hidden md:block text-[10px] text-gray-400 border border-gray-200 rounded px-2 py-1 font-mono">
          FY 2024/25 · Q3
        </span>

        {/* Date/time */}
        <span className="hidden lg:block text-[11px] text-gray-400">{now}</span>

        {/* Live dot */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 status-dot-live" />
          <span className="text-[10px] text-gray-400 hidden sm:block">Live</span>
        </div>

        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* User chip — links to profile */}
        {user && (
          <Link href="/profile" className="flex items-center gap-2 pl-3 border-l border-gray-200 ml-1 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold text-gray-900 leading-tight">{user.name.split(' ')[0]}</p>
              <p className="text-[9px] text-gray-400 capitalize leading-tight">{user.role}</p>
            </div>
          </Link>
        )}
      </div>
    </header>
  )
}
