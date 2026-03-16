'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTeam } from '@/lib/team-context'
import type { Task, TaskStatus, TaskPriority } from '@/types'
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle,
  Activity, Calendar, ChevronDown, ChevronRight,
  MessageSquare, Save, Target,
} from 'lucide-react'

/* ── Config ─────────────────────────────────────────────────────────────────── */
const PRIORITY_CFG: Record<TaskPriority, { label: string; badge: string; dot: string }> = {
  low:    { label: 'Low',    badge: 'bg-gray-100 text-gray-600 border-gray-200',   dot: 'bg-gray-400' },
  medium: { label: 'Medium', badge: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  high:   { label: 'High',   badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  urgent: { label: 'Urgent', badge: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
  { value: 'overdue',     label: 'Overdue' },
]

/* ── Task Detail Card (expandable) ──────────────────────────────────────────── */
function TaskCard({ task, onUpdate }: {
  task: Task
  onUpdate: (progress: number, status: TaskStatus, notes: string) => void
}) {
  const [open,     setOpen]     = useState(false)
  const [progress, setProgress] = useState(task.progress)
  const [status,   setStatus]   = useState<TaskStatus>(task.status)
  const [notes,    setNotes]    = useState(task.notes ?? '')
  const [saved,    setSaved]    = useState(false)

  const p = PRIORITY_CFG[task.priority]
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed'

  function handleSave() {
    onUpdate(progress, status, notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const barColor = progress === 100 ? '#10B981' : progress >= 60 ? '#3B82F6' : progress >= 30 ? '#D97706' : '#9CA3AF'

  return (
    <div className={`bg-white border rounded-lg overflow-hidden transition-colors ${
      task.status === 'completed' ? 'border-emerald-200' :
      isOverdue ? 'border-red-200' :
      task.status === 'in_progress' ? 'border-blue-200' :
      'border-gray-200'
    }`}>

      {/* Header row */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Status dot */}
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${p.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.badge}`}>{p.label}</span>
            {isOverdue && task.status !== 'completed' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Overdue
              </span>
            )}
            {task.status === 'completed' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Done
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">{task.description}</p>
          )}

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 max-w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, background: barColor }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: barColor }}>{task.progress}%</span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {task.dueDate}
            </span>
            <span className="text-[10px] text-gray-400">· Assigned by {task.assignedBy}</span>
          </div>
        </div>

        <div className="shrink-0 text-gray-400 mt-0.5">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded update panel */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/30">

          {task.description && (
            <div className="bg-white border border-gray-100 rounded p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Task Description</p>
              <p className="text-xs text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {task.program && (
            <p className="text-[11px] text-gray-400">Program: <span className="font-semibold text-gray-600">{task.program}</span></p>
          )}

          {task.status === 'completed' && task.completedAt && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">Completed on {task.completedAt}</p>
            </div>
          )}

          {task.status !== 'completed' && (
            <div className="space-y-4">

              {/* Status selector */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatus(opt.value)
                        if (opt.value === 'completed') setProgress(100)
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${
                        status === opt.value
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-gray-600">Progress</label>
                  <span className="text-xs font-black" style={{ color: barColor }}>{progress}%</span>
                </div>
                <input
                  type="range" min={0} max={100} step={5} value={progress}
                  onChange={e => {
                    const v = Number(e.target.value)
                    setProgress(v)
                    if (v === 100) setStatus('completed')
                    else if (v > 0 && status === 'pending') setStatus('in_progress')
                  }}
                  className="w-full accent-blue-700"
                />
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: barColor }} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Progress Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Briefly describe what you have done or any blockers…"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-white"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Update
                </button>
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MyTasksPage() {
  const { user } = useAuth()
  const { officers, tasksByOfficer, updateTaskProgress } = useTeam()

  if (!user) return null

  // Find this officer's record by matching their name
  const myRecord = officers.find(o => o.name === user.name)
  const myTasks  = myRecord ? tasksByOfficer(myRecord.id) : []

  // Sort: overdue first, then by due date
  const sorted = [...myTasks].sort((a, b) => {
    const aOver = new Date(a.dueDate) < new Date() && a.status !== 'completed'
    const bOver = new Date(b.dueDate) < new Date() && b.status !== 'completed'
    if (aOver && !bOver) return -1
    if (!aOver && bOver) return 1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const total     = myTasks.length
  const pending   = myTasks.filter(t => t.status === 'pending').length
  const inProg    = myTasks.filter(t => t.status === 'in_progress').length
  const completed = myTasks.filter(t => t.status === 'completed').length
  const overdue   = myTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length

  // Group by status for tabs
  const [activeTab, setActiveTab] = useState<'all' | TaskStatus>('all')
  const displayed = activeTab === 'all' ? sorted : sorted.filter(t => {
    if (activeTab === 'overdue') return t.status !== 'completed' && new Date(t.dueDate) < new Date()
    return t.status === activeTab
  })

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tasks assigned to you · Update progress and add notes
          {myRecord && <span className="ml-2 text-gray-400">· {myRecord.position}</span>}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: ClipboardList, label: 'Total Tasks',   value: total,     color: '#3B82F6' },
          { icon: Activity,      label: 'In Progress',   value: inProg,    color: '#D97706' },
          { icon: CheckCircle2,  label: 'Completed',     value: completed, color: '#10B981' },
          { icon: AlertTriangle, label: 'Overdue',       value: overdue,   color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      {total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-gray-800">Overall Completion</span>
            </div>
            <span className="text-sm font-black text-emerald-600">{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((completed / total) * 100)}%` }} />
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-gray-400">
            <span>{completed} completed</span>
            <span>{inProg} in progress</span>
            <span>{pending} pending</span>
            {overdue > 0 && <span className="text-red-600 font-semibold">{overdue} overdue</span>}
          </div>
        </div>
      )}

      {/* Tab filter */}
      {total > 0 && (
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
          {([
            { key: 'all',         label: `All (${total})` },
            { key: 'pending',     label: `Pending (${pending})` },
            { key: 'in_progress', label: `In Progress (${inProg})` },
            { key: 'completed',   label: `Completed (${completed})` },
            { key: 'overdue',     label: `Overdue (${overdue})` },
          ] as { key: 'all' | TaskStatus; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {!myRecord ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg py-16 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No tasks yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your manager hasn&apos;t assigned any tasks to you yet.
          </p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg py-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">
            {activeTab === 'all' ? 'No tasks assigned yet.' : `No ${activeTab.replace('_', ' ')} tasks.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={(prog, stat, notes) => updateTaskProgress(task.id, prog, stat, notes)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
