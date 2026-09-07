import { getDocsBySection } from '@/lib/docs'
import Sidebar from '@/components/sidebar'

export default function DocLayout({ children }: { children: React.ReactNode }) {
  const docsBySection = getDocsBySection()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar docsBySection={docsBySection} />
      <main className="ml-56 mr-56 min-h-screen">
        {children}
      </main>
    </div>
  )
}
