import Link from 'next/link'
import DocHeader from '@/components/doc-header'
import { getSearchIndex } from '@/lib/search'

// Grey placeholder used in place of a cover image. Swap these blocks for real
// covers once the field photography is selected.
const PLACEHOLDER = 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)'

export default function Home() {
  const searchDocs = getSearchIndex()

  const sections = [
    { title: 'Virtual Tour', desc: 'Insta360 capture procedures. One guide per site condition.', links: [
      { label: 'Indoor Congested Area', desc: 'Tight or crowded interiors: corridors, plant rooms, occupied floors.', href: '/docs/02-indoor-congested-area' },
      { label: 'Indoor Area', desc: 'Open interiors: lobbies, halls, large floor plates.', href: '/docs/03-indoor-area' },
      { label: 'Outdoor Area', desc: 'External areas: streets, plazas, site perimeters.', href: '/docs/04-outdoor-area' },
    ]},
    { title: '3D Reconstruction', desc: 'DJI capture procedures for reconstruction and mapping output.', links: [
      { label: '3D Reconstruction and Mapping', desc: 'Area scanning with the DJI camera for mesh and map output.', href: '/docs/05-3d-reconstruction-mapping' },
    ]},
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--background))', color: 'hsl(var(--foreground))', display: 'flex', flexDirection: 'column', paddingTop: '48px' }}>
      <DocHeader searchDocs={searchDocs} />

      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '48px 16px', flex: 1, width: '100%' }}>

        <div className="mb-12">
          <h1 className="text-3xl font-medium mb-2">POLYTRON.AI Scanning Field Guides</h1>
          <p className="text-muted-foreground text-sm">
            Field procedures for 360 and DJI area scanning. Each guide covers one site condition, from equipment setup through to data handoff.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          <Link href="/docs/01-overview" className="group block rounded-lg border border-border overflow-hidden transition-colors" style={{ position: 'relative', minHeight: '180px', backgroundImage: PLACEHOLDER, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>Overview</p>
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>Choose the right guide for the site, the camera, and the output you need.</p>
            </div>
          </Link>
          <Link href="/docs/05-3d-reconstruction-mapping" className="group block rounded-lg border border-border overflow-hidden transition-colors" style={{ position: 'relative', minHeight: '180px', backgroundImage: PLACEHOLDER, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>3D Reconstruction and Mapping</p>
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>Area scanning with the DJI camera for mesh and map output.</p>
            </div>
          </Link>
        </div>

        <div className="mb-8 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8" style={{ background: '#ECE3D5', border: '1px solid hsl(var(--border))' }}>
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Getting started</p>
            <h2 className="text-base font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>First scan on site?</h2>
            <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>Read the overview to select your guide, then follow that guide from the equipment checklist onward. Do the field quality checks before you leave the site.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
            <Link href="/docs/01-overview" className="inline-flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5" style={{ background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', whiteSpace: 'nowrap' }}>
              Overview
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </Link>
            <Link href="/docs/03-indoor-area" className="inline-flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5" style={{ background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', whiteSpace: 'nowrap' }}>
              Indoor Area
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </Link>
            <Link href="/docs/04-outdoor-area" className="inline-flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5" style={{ background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))', whiteSpace: 'nowrap' }}>
              Outdoor Area
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-base font-medium">Browse by section</h2>
        </div>

        <div className="flex flex-col gap-4 mb-16">
          {sections.map((section) => (
            <div key={section.title} className="bg-background border border-border rounded-lg overflow-hidden">
              <div style={{ padding: '16px 20px 20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--foreground))' }}>{section.title}</h3>
                <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginBottom: '12px' }}>{section.desc}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {section.links.map((link: { label: string, desc: string, href: string }) => (
                    <Link key={link.href + link.label} href={link.href} className="group block rounded-md border border-border overflow-hidden transition-all hover:border-foreground/20 hover:shadow-sm" style={{ background: 'hsl(var(--background))' }}>
                      <div style={{ height: '84px', backgroundImage: PLACEHOLDER, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '2px', lineHeight: 1.3 }}>{link.label}</p>
                        <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.4 }}>{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <footer style={{ borderTop: '1px solid hsl(var(--border))', padding: '16px', maxWidth: '1440px', width: '100%', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>POLYTRON.AI Scanning Field Guides</p>
        <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Vizzio Confidential</p>
      </footer>
    </div>
  )
}
