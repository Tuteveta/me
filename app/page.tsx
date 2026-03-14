import Link from 'next/link'
import {
  BarChart3, ShieldCheck, Users, FileText, TrendingUp,
  ArrowRight, ChevronDown, CheckCircle2, Monitor,
} from 'lucide-react'

/* ── Data ──────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Monitor,
    title: 'Real-time Monitoring',
    desc: 'Track all ICT programs and projects in real time with live status indicators and automated alerts.',
    color: '#3B82F6',
  },
  {
    icon: TrendingUp,
    title: 'KPI Tracking',
    desc: 'Set targets, measure actuals, and monitor key performance indicators with traffic-light dashboards.',
    color: '#10B981',
  },
  {
    icon: BarChart3,
    title: 'Budget Analytics',
    desc: 'Visualise budget utilisation against allocations across all five program areas with D3-powered charts.',
    color: '#D97706',
  },
  {
    icon: FileText,
    title: 'Report Management',
    desc: 'Submit, track, and distribute quarterly and monthly programme reports from a single interface.',
    color: '#8B5CF6',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    desc: 'Three access tiers — Super, Admin, and Officer — ensure data governance and accountability.',
    color: '#CE1126',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Auditable',
    desc: 'Full audit trail, secure authentication, and compliance with GoPNG ICT security standards.',
    color: '#06B6D4',
  },
]

const STATS = [
  { value: '5',   label: 'Programme Areas' },
  { value: '8+',  label: 'Active Projects' },
  { value: '10',  label: 'KPIs Monitored' },
  { value: '9M+', label: 'Beneficiaries' },
]

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'About',    href: '#about' },
]

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">

          {/* Title only — no logo */}
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-blue-700 tracking-widest uppercase leading-none hidden sm:block">
              Government of Papua New Guinea
            </p>
            <p className="text-sm font-bold text-gray-900 leading-tight truncate">
              <span className="hidden sm:inline">Dept. of Information Communication &amp; Technology</span>
              <span className="sm:hidden">DICT M&amp;E Dashboard</span>
            </p>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="/auth/login"
            className="flex items-center gap-2 bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-blue-800 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── Hero — centered ────────────────────────────────────────────────── */}
      <section className="pt-16 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto w-full py-10 sm:py-14 text-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 status-dot-live" />
            <span className="text-blue-700 text-xs font-semibold tracking-wider uppercase">
              M&amp;E Dashboard · FY 2024/25
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4">
            <span className="text-gray-900">ICT Monitoring </span>
            <span className="text-blue-700">&amp; Evaluation</span>
            <span className="text-gray-900"> Dashboard</span>
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-7 max-w-lg mx-auto">
            A single pane of glass to monitor, evaluate, and optimise all ICT
            programs across Papua New Guinea.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-7">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 bg-blue-700 text-white font-bold px-6 py-2.5 rounded hover:bg-blue-800 transition-colors text-sm"
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded hover:border-gray-400 transition-colors text-sm"
            >
              Explore Features
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Feature checks — horizontal */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5">
            {['Real-time project tracking', 'KPI target vs actual', 'Role-based access control'].map(item => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-200 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-blue-700 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Everything you need for effective M&amp;E
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built to the GoPNG M&amp;E framework — from project intake to final evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="border border-gray-200 rounded-lg p-6 bg-white hover:border-blue-200 transition-colors">
                <div className="inline-flex p-2.5 rounded mb-4" style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Government of Papua New Guinea
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to transform ICT governance<br className="hidden md:block" /> in Papua New Guinea?
          </h2>
          <p className="text-blue-200 mb-8 text-base max-w-xl mx-auto">
            Sign in with your DICT credentials to access real-time programme data,
            KPI dashboards, and reporting tools.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-black px-10 py-4 rounded hover:bg-blue-50 transition-colors text-sm"
          >
            Sign In to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-6 text-blue-300 text-xs">
            Authorised DICT personnel only · Protected by GoPNG ICT Security Policy
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10">

            {/* Brand */}
            <div>
              <p className="text-white text-sm font-bold mb-1">DICT M&amp;E Dashboard</p>
              <p className="text-gray-500 text-xs mb-4">Papua New Guinea</p>
              <p className="text-sm leading-relaxed">
                Monitoring and Evaluation platform for the Department of Information
                Communication &amp; Technology, Government of Papua New Guinea.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Platform</p>
              <ul className="space-y-2 text-sm">
                {['Dashboard', 'Projects', 'KPI Monitoring', 'Reports', 'User Management'].map(l => (
                  <li key={l}>
                    <Link href="/auth/login" className="hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Contact</p>
              <ul className="space-y-2 text-sm">
                <li>ICT House, Waigani Drive</li>
                <li>Port Moresby, NCD 121</li>
                <li>Papua New Guinea</li>
                <li className="pt-2">
                  <a href="mailto:ict@dict.gov.pg" className="hover:text-white transition-colors">ict@dict.gov.pg</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs">
              © 2025 Department of Information Communication &amp; Technology, Government of Papua New Guinea.
            </p>
            <p className="text-xs text-gray-600">v1.0.0 · M&amp;E Build · FY 2024/25</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
