'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useTeam } from '@/lib/team-context'
import { DICT_DIVISIONS, DICT_PROGRAMS } from '@/lib/org-data'
import type { Officer, Task, TaskPriority, TaskStatus, UserRole } from '@/types'
import {
  Users, Plus, X, Trash2, ClipboardList, CheckCircle2,
  Clock, AlertTriangle, ChevronDown, ChevronRight,
  Edit2, Save, BarChart3, Target, Calendar,
  UserPlus, Briefcase, Activity,
} from 'lucide-react'

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 9) }
function today() { return new Date().toISOString().slice(0, 10) }

const PRIORITY_CFG: Record<TaskPriority, { label: string; badge: string; dot: string }> = {
  low:    { label: 'Low',    badge: 'bg-gray-100 text-gray-600 border-gray-200',       dot: 'bg-gray-400' },
  medium: { label: 'Medium', badge: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500' },
  high:   { label: 'High',   badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500' },
  urgent: { label: 'Urgent', badge: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500' },
}

const STATUS_CFG: Record<TaskStatus, { label: string; badge: string; icon: React.ElementType }> = {
  pending:     { label: 'Pending',     badge: 'bg-gray-100 text-gray-600',        icon: Clock },
  in_progress: { label: 'In Progress', badge: 'bg-blue-50 text-blue-700',         icon: Activity },
  completed:   { label: 'Completed',   badge: 'bg-emerald-50 text-emerald-700',   icon: CheckCircle2 },
  overdue:     { label: 'Overdue',     badge: 'bg-red-50 text-red-700',           icon: AlertTriangle },
}

/* ── Add Officer Modal ──────────────────────────────────────────────────────── */
function AddOfficerModal({
  managerName, managerRole, onClose, onAdd,
}: {
  managerName: string; managerRole: UserRole
  onClose: () => void; onAdd: (o: Officer) => void
}) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [position, setPosition] = useState('')
  const [division, setDivision] = useState(DICT_DIVISIONS[0])
  const [program,  setProgram]  = useState('')
  const [error,    setError]    = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())     { setError('Full name is required.'); return }
    if (!position.trim()) { setError('Position/job title is required.'); return }
    onAdd({
      id: uid(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      position: position.trim(),
      division,
      program: program || undefined,
      createdBy: managerName,
      createdByRole: managerRole,
      status: 'active',
      createdAt: today(),
    })
    onClose()
  }

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const lbl = 'block text-[11px] font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Add Officer</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Create a new officer under your supervision</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={lbl}>Full Name <span className="text-red-500">*</span></label>
              <input className={inp} placeholder="e.g. John Doe" value={name}
                onChange={e => { setName(e.target.value); setError('') }} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Position / Job Title <span className="text-red-500">*</span></label>
              <input className={inp} placeholder="e.g. Data Officer" value={position}
                onChange={e => { setPosition(e.target.value); setError('') }} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Email Address</label>
              <input type="email" className={inp} placeholder="officer@dict.gov.pg" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Division</label>
              <select className={inp} value={division} onChange={e => setDivision(e.target.value)}>
                {DICT_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Program (optional)</label>
              <select className={inp} value={program} onChange={e => setProgram(e.target.value)}>
                <option value="">— None —</option>
                {DICT_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800">
              <UserPlus className="w-3.5 h-3.5" /> Add Officer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Assign Task Modal ──────────────────────────────────────────────────────── */
function AssignTaskModal({
  officer, managerName, managerRole, onClose, onAssign,
}: {
  officer: Officer; managerName: string; managerRole: UserRole
  onClose: () => void; onAssign: (t: Task) => void
}) {
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [priority,    setPriority]    = useState<TaskPriority>('medium')
  const [dueDate,     setDueDate]     = useState('')
  const [program,     setProgram]     = useState(officer.program || '')
  const [error,       setError]       = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim())   { setError('Task title is required.'); return }
    if (!dueDate)        { setError('Due date is required.'); return }
    onAssign({
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      assignedTo: officer.id,
      assignedToName: officer.name,
      assignedBy: managerName,
      assignedByRole: managerRole,
      division: officer.division,
      program: program || undefined,
      priority,
      status: 'pending',
      dueDate,
      createdAt: today(),
      progress: 0,
    })
    onClose()
  }

  const inp = 'w-full border border-gray-200 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
  const lbl = 'block text-[11px] font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Assign Task</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">To: <span className="font-semibold text-gray-600">{officer.name}</span> · {officer.position}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
          <div>
            <label className={lbl}>Task Title <span className="text-red-500">*</span></label>
            <input className={inp} placeholder="e.g. Compile Q3 M&E report" value={title}
              onChange={e => { setTitle(e.target.value); setError('') }} />
          </div>
          <div>
            <label className={lbl}>Description</label>
            <textarea rows={2} className={`${inp} resize-none`}
              placeholder="Details, scope, or expected deliverable…"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Priority</label>
              <select className={inp} value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                {(Object.keys(PRIORITY_CFG) as TaskPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Due Date <span className="text-red-500">*</span></label>
              <input type="date" className={inp} value={dueDate}
                onChange={e => { setDueDate(e.target.value); setError('') }} />
            </div>
          </div>
          <div>
            <label className={lbl}>Program (optional)</label>
            <select className={inp} value={program} onChange={e => setProgram(e.target.value)}>
              <option value="">— None —</option>
              {DICT_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800">
              <ClipboardList className="w-3.5 h-3.5" /> Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Task Row ───────────────────────────────────────────────────────────────── */
function TaskRow({ task, onDelete }: { task: Task; onDelete: () => void }) {
  const p   = PRIORITY_CFG[task.status === 'overdue' ? 'urgent' : task.priority]
  const s   = STATUS_CFG[task.status]
  const SI  = s.icon
  const overdue = new Date(task.dueDate) < new Date() && task.status !== 'completed'

  return (
    <div className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${overdue && task.status !== 'overdue' ? 'bg-red-50/20' : ''}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${p.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold text-gray-800">{task.title}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.badge}`}>{p.label}</span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${s.badge}`}>
            <SI className="w-2.5 h-2.5" /> {s.label}
          </span>
        </div>
        {task.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{task.description}</p>}
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex-1 max-w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${task.progress}%`, background: task.progress === 100 ? '#10B981' : task.progress >= 50 ? '#3B82F6' : '#D97706' }} />
          </div>
          <span className="text-[10px] text-gray-400">{task.progress}%</span>
          <span className={`text-[10px] flex items-center gap-1 ${overdue && task.status !== 'completed' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
            <Calendar className="w-3 h-3" /> {task.dueDate}
          </span>
          {task.notes && <span className="text-[10px] text-gray-400 italic truncate max-w-40">&ldquo;{task.notes}&rdquo;</span>}
        </div>
      </div>
      <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

/* ── Officer Card ───────────────────────────────────────────────────────────── */
function OfficerCard({
  officer, tasks, expanded, onToggle, onAssignTask, onDeactivate, onDelete, managerName, managerRole,
}: {
  officer: Officer; tasks: Task[]; expanded: boolean
  onToggle: () => void
  onAssignTask: (o: Officer) => void
  onDeactivate: (id: string) => void
  onDelete: (id: string) => void
  managerName: string; managerRole: UserRole
}) {
  const { deleteTask } = useTeam()
  const total     = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProg    = tasks.filter(t => t.status === 'in_progress').length
  const overdue   = tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && new Date(t.dueDate) < new Date())).length
  const pending   = tasks.filter(t => t.status === 'pending').length
  const compRate  = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${officer.status === 'inactive' ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}>

      {/* Officer header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-black shrink-0">
          {officer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">{officer.name}</p>
            {officer.status === 'inactive' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Inactive</span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{officer.position} · {officer.division}</p>
          {officer.email && <p className="text-[10px] text-gray-400">{officer.email}</p>}
          {/* Mini performance bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 max-w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${compRate}%` }} />
            </div>
            <span className="text-[10px] text-gray-400">{compRate}% done</span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-[10px] text-gray-500">{total} task{total !== 1 ? 's' : ''}</span>
            {overdue > 0 && (
              <span className="text-[10px] font-bold text-red-600">{overdue} overdue</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {officer.status === 'active' && (
            <button onClick={() => onAssignTask(officer)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 border border-blue-200 bg-blue-50 px-2.5 py-1.5 rounded hover:bg-blue-100 transition-colors">
              <Plus className="w-3 h-3" /> Task
            </button>
          )}
          <button onClick={onToggle} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Task stats strip */}
      <div className="border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100 bg-gray-50/60">
        {[
          { label: 'Pending',     count: pending,   color: 'text-gray-600' },
          { label: 'In Progress', count: inProg,    color: 'text-blue-600' },
          { label: 'Completed',   count: completed, color: 'text-emerald-600' },
          { label: 'Overdue',     count: overdue,   color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="text-center py-2">
            <p className={`text-sm font-black ${s.color}`}>{s.count}</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tasks list */}
      {expanded && (
        <div className="border-t border-gray-100">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-1 text-gray-400">
              <ClipboardList className="w-6 h-6" />
              <p className="text-xs">No tasks assigned yet.</p>
              {officer.status === 'active' && (
                <button onClick={() => onAssignTask(officer)}
                  className="mt-1 text-xs text-blue-600 font-medium hover:underline">
                  Assign first task
                </button>
              )}
            </div>
          ) : (
            tasks.map(t => (
              <TaskRow key={t.id} task={t} onDelete={() => deleteTask(t.id)} />
            ))
          )}
        </div>
      )}

      {/* Footer actions */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/40 flex items-center gap-2">
          <button
            onClick={() => onDeactivate(officer.id)}
            className="text-[11px] text-gray-400 hover:text-amber-600 font-medium transition-colors"
          >
            {officer.status === 'active' ? 'Deactivate' : 'Reactivate'}
          </button>
          <span className="text-gray-200">·</span>
          <button
            onClick={() => onDelete(officer.id)}
            className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors"
          >
            Remove officer
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function MyTeamPage() {
  const { user } = useAuth()
  const { officersByManager, tasksByManager, addOfficer, updateOfficer, removeOfficer, addTask } = useTeam()

  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [assigningTo, setAssigningTo]       = useState<Officer | null>(null)
  const [expanded, setExpanded]             = useState<Record<string, boolean>>({})

  if (!user) return null

  const myOfficers = officersByManager(user.name)
  const myTasks    = tasksByManager(user.name)

  // Stats
  const totalOfficers = myOfficers.length
  const activeOfficers = myOfficers.filter(o => o.status === 'active').length
  const totalTasks   = myTasks.length
  const completedTasks = myTasks.filter(t => t.status === 'completed').length
  const overdueTasks   = myTasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date()).length
  const compRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  function toggleOfficer(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleDeactivate(id: string) {
    const o = myOfficers.find(x => x.id === id)
    if (!o) return
    updateOfficer({ ...o, status: o.status === 'active' ? 'inactive' : 'active' })
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">My Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage officers · Assign tasks · Monitor performance
          </p>
        </div>
        <button
          onClick={() => setShowAddOfficer(true)}
          className="flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" /> Add Officer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users,        label: 'Officers',       value: activeOfficers,  sub: `${totalOfficers} total`,          color: '#3B82F6' },
          { icon: ClipboardList,label: 'Tasks Assigned', value: totalTasks,      sub: `${completedTasks} completed`,     color: '#8B5CF6' },
          { icon: Target,       label: 'Completion Rate', value: `${compRate}%`, sub: 'across all officers',             color: '#10B981' },
          { icon: AlertTriangle,label: 'Overdue Tasks',  value: overdueTasks,    sub: overdueTasks > 0 ? 'Action needed' : 'All on track', color: overdueTasks > 0 ? '#EF4444' : '#10B981' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Officer list */}
      {myOfficers.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg py-16 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No officers yet</p>
          <p className="text-xs text-gray-400 mt-1">Add officers who work under your supervision.</p>
          <button onClick={() => setShowAddOfficer(true)}
            className="mt-4 flex items-center gap-1.5 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-800 transition-colors mx-auto">
            <UserPlus className="w-3.5 h-3.5" /> Add First Officer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOfficers.map(officer => (
            <OfficerCard
              key={officer.id}
              officer={officer}
              tasks={myTasks.filter(t => t.assignedTo === officer.id)}
              expanded={!!expanded[officer.id]}
              onToggle={() => toggleOfficer(officer.id)}
              onAssignTask={o => setAssigningTo(o)}
              onDeactivate={handleDeactivate}
              onDelete={removeOfficer}
              managerName={user.name}
              managerRole={user.role}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddOfficer && (
        <AddOfficerModal
          managerName={user.name}
          managerRole={user.role}
          onClose={() => setShowAddOfficer(false)}
          onAdd={o => { addOfficer(o); setShowAddOfficer(false); setExpanded(prev => ({ ...prev, [o.id]: true })) }}
        />
      )}
      {assigningTo && (
        <AssignTaskModal
          officer={assigningTo}
          managerName={user.name}
          managerRole={user.role}
          onClose={() => setAssigningTo(null)}
          onAssign={t => { addTask(t); setAssigningTo(null) }}
        />
      )}
    </div>
  )
}
