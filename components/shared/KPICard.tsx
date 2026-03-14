import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'stable'
  trendLabel?: string
  color?: string
  icon?: React.ElementType
  status?: 'good' | 'warning' | 'danger' | 'neutral'
}

const STATUS_COLORS = {
  good:    'border-l-emerald-500',
  warning: 'border-l-amber-500',
  danger:  'border-l-red-500',
  neutral: 'border-l-blue-500',
}

const TREND_ICONS = {
  up:     TrendingUp,
  down:   TrendingDown,
  stable: Minus,
}

const TREND_COLORS = {
  up:     'text-emerald-600',
  down:   'text-red-600',
  stable: 'text-gray-400',
}

export default function KPICard({
  label, value, sub, trend, trendLabel, color, icon: Icon, status = 'neutral',
}: KPICardProps) {
  const TrendIcon = trend ? TREND_ICONS[trend] : null

  return (
    <div className={`bg-white border border-gray-200 border-l-[3px] rounded-sm p-4 ${STATUS_COLORS[status]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-gray-500 leading-tight">{label}</p>
        {Icon && (
          <div
            className="p-1.5 rounded shrink-0"
            style={{ background: color ? `${color}15` : '#3B82F615' }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: color ?? '#3B82F6' }} />
          </div>
        )}
      </div>

      <div className="mt-1.5">
        <span
          className="text-2xl font-black tracking-tight"
          style={{ color: color ?? '#111827' }}
        >
          {value}
        </span>
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </div>

      {(trend || trendLabel) && (
        <div className="mt-2 flex items-center gap-1">
          {TrendIcon && trend && (
            <TrendIcon className={`w-3 h-3 ${TREND_COLORS[trend]}`} />
          )}
          {trendLabel && (
            <span className={`text-[10px] font-medium ${trend ? TREND_COLORS[trend] : 'text-gray-400'}`}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
