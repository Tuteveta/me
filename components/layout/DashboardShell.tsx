import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-5 page-enter">
          {children}
        </main>
      </div>
    </div>
  )
}
