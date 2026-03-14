'use client'

import { useAuth } from '@/lib/auth-context'
import { redirect } from 'next/navigation'
import { Building2, Bell, Shield, Database, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  if (user && user.role === 'officer') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-base font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">System and notification configuration</p>
      </div>

      {/* Department Info */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-700">Department Information</h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Department Name', value: 'Dept. of Information Communication & Technology', readOnly: true },
            { label: 'Short Name',      value: 'DICT',                    readOnly: true },
            { label: 'Division',        value: 'M&E Division',            readOnly: false },
            { label: 'Fiscal Year',     value: 'FY 2024/25',              readOnly: false },
            { label: 'System URL',      value: 'https://me.dict.gov.pg',  readOnly: true },
            { label: 'Support Email',   value: 'ict@dict.gov.pg',         readOnly: false },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">{f.label}</label>
              <input
                defaultValue={f.value}
                readOnly={f.readOnly}
                className={`w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  f.readOnly ? 'bg-gray-50 text-gray-400 cursor-default' : 'bg-white text-gray-900'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification settings */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-700">Notifications</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: 'Report due reminders (7 days before)', description: 'Email officers when reports are due within 7 days', defaultChecked: true },
            { label: 'Overdue report alerts',                description: 'Alert admins when reports pass their due date',  defaultChecked: true },
            { label: 'KPI off-track alerts',                 description: 'Notify when a KPI drops below 70% of target',   defaultChecked: true },
            { label: 'Budget overrun warnings',              description: 'Alert when a project spend exceeds 90% of budget', defaultChecked: false },
            { label: 'New user registration',                description: 'Notify super admin on new user creation',       defaultChecked: user?.role === 'super' },
          ].map(n => (
            <label key={n.label} className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input type="checkbox" className="sr-only peer" defaultChecked={n.defaultChecked} />
                <div className="w-8 h-4 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800 group-hover:text-gray-900">{n.label}</p>
                <p className="text-[11px] text-gray-400">{n.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      {user?.role === 'super' && (
        <div className="bg-white border border-gray-200 rounded-sm">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <h2 className="text-xs font-semibold text-gray-700">Security (Super Admin)</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Session timeout (minutes)', type: 'number', defaultValue: '30' },
              { label: 'Max failed login attempts',  type: 'number', defaultValue: '5' },
              { label: 'Password minimum length',    type: 'number', defaultValue: '8' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <label className="text-xs text-gray-700">{s.label}</label>
                <input
                  type={s.type}
                  defaultValue={s.defaultValue}
                  className="border border-gray-200 rounded px-3 py-1.5 text-xs w-24 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data */}
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <h2 className="text-xs font-semibold text-gray-700">Data &amp; System</h2>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          <button className="text-xs border border-gray-200 rounded px-4 py-2 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            Export Dashboard Data (CSV)
          </button>
          <button className="text-xs border border-gray-200 rounded px-4 py-2 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            Generate System Report
          </button>
          {user?.role === 'super' && (
            <button className="text-xs border border-red-200 rounded px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
              Clear Cache &amp; Reset
            </button>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded hover:bg-blue-800 transition-colors">
          <Save className="w-3.5 h-3.5" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
