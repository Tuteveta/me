'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import type { UserRole } from '@/lib/auth-context'
import {
  LayoutDashboard, FolderKanban, Target, FileText,
  Settings, Users, ChevronLeft, ChevronRight, LogOut, ClipboardList, X, Banknote,
  SendHorizonal, BadgeCheck, UserCircle, Network, BookMarked, PieChart, UserCheck, ClipboardCheck, Wallet,
} from 'lucide-react'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview',          href: '/dashboard',      roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs', 'officer'] },
  { icon: Network,         label: 'Organisation',       href: '/organisation',  roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: BookMarked,      label: 'Corporate Plan',     href: '/corporate-plan', roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: PieChart,        label: 'Expenditure Budget', href: '/budget',        roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: FolderKanban,    label: 'Projects',           href: '/projects',      roles: ['super', 'admin'] },
  { icon: Target,          label: 'KPI Monitoring',     href: '/kpi',           roles: ['super', 'admin'] },
  { icon: FileText,        label: 'Reports',            href: '/reports',       roles: ['super', 'admin'] },
  { icon: ClipboardList,   label: 'Annual Workplan',    href: '/workplan',      roles: ['super', 'admin', 'finance'] },
  { icon: ClipboardCheck,  label: 'Quarterly Reports',  href: '/quarterly-report', roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: Wallet, label: 'Budget Plan', href: '/budget-plan', roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: Settings,        label: 'Settings',           href: '/settings',      roles: ['super', 'admin'] },
  { icon: Users,           label: 'User Management',    href: '/users',         roles: ['super'] },
  { icon: SendHorizonal,   label: 'My Requests',        href: '/requests',      roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs', 'officer'] },
  { icon: BadgeCheck,      label: 'Approvals',          href: '/approvals',     roles: ['executive', 'deputy', 'dcs'] },
  { icon: Banknote,        label: 'Finance',            href: '/finance',       roles: ['finance'] },
  { icon: UserCheck,       label: 'My Team',            href: '/my-team',       roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs'] },
  { icon: ClipboardList,   label: 'My Tasks',           href: '/my-tasks',      roles: ['officer'] },
  { icon: UserCircle,      label: 'My Profile',         href: '/profile',       roles: ['super', 'admin', 'finance', 'executive', 'deputy', 'dcs', 'officer'] },
]

const ROLE_COLORS: Record<UserRole, string> = {
  super:     'bg-red-100 text-red-700',
  admin:     'bg-amber-100 text-amber-700',
  finance:   'bg-emerald-100 text-emerald-700',
  executive: 'bg-purple-100 text-purple-700',
  deputy:    'bg-indigo-100 text-indigo-700',
  dcs:       'bg-teal-100 text-teal-700',
  officer:   'bg-gray-100 text-gray-700',
}

const ROLE_DISPLAY: Record<UserRole, string> = {
  super:     'System',
  admin:     'Manager',
  finance:   'Finance Manager',
  executive: 'Executive',
  deputy:    'Deputy',
  dcs:       'Director',
  officer:   'Officer',
}

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const visible = NAV_ITEMS.filter(
    item => !user || item.roles.includes(user.role)
  )

  const inner = (
    <aside
      className={`
        flex flex-col h-full bg-white border-r border-gray-200
        transition-all duration-200 shrink-0
        ${collapsed ? 'w-14' : 'w-55'}
      `}
    >
      {/* Brand */}
      <div className={`flex items-center h-12 border-b border-gray-200 px-3 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-black text-blue-700 leading-tight tracking-wide truncate">DICT</p>
            <p className="text-[9px] text-gray-400 leading-tight truncate">M&amp;E Dashboard</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-4 py-2">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {visible.map(item => {
            const active = pathname === item.href
            return (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onClose}
                  className={`
                    flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium
                    transition-colors select-none
                    ${active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + collapse */}
      <div className="border-t border-gray-200 shrink-0">
        {user && (
          <div className={`px-3 py-2.5 flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-black shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ROLE_COLORS[user.role]}`}>
                  {ROLE_DISPLAY[user.role]}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={logout}
          title="Sign out"
          className={`
            w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-500
            hover:bg-red-50 hover:text-red-600 transition-colors
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden md:flex w-full items-center justify-center py-2 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: inline sidebar */}
      <div className="hidden md:flex h-screen">
        {inner}
      </div>

      {/* Mobile: fixed drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 flex h-full
          transition-transform duration-250 ease-in-out
          md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {inner}
      </div>
    </>
  )
}
