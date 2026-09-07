import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { BASE_PATH, SITE_NAME, PDF_PREFIX } from '@/lib/site'
import { getLastUpdated } from '@/lib/last-updated'

export const runtime = 'nodejs'
export const maxDuration = 300

// Leave headroom under maxDuration so a slow full-guide run returns the pages
// it managed to render instead of being killed mid-response.
const BUDGET_MS = 240_000
const PAGES_PER_BROWSER = 3

const CSS =
  'aside,header,.no-print{display:none!important}' +
  'main{margin:0!important}' +
  'main>div{padding:20px 0!important}' +
  'main>div>div:first-child{display:none!important}' +
  'video{display:none!important}'

const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function header(): string {
  return (
    '<div style="width:100%;font-family:Inter,system-ui,sans-serif;font-size:7pt;color:#999;' +
    'display:flex;justify-content:space-between;align-items:center;padding:0 20mm 2mm;' +
    'border-bottom:0.3pt solid #e5e5e5">' +
    '<span style="font-weight:600">' + esc(SITE_NAME) + '</span>' +
    '<span>Confidential</span></div>'
  )
}

function footer(): string {
  return (
    '<div style="width:100%;font-family:Inter,system-ui,sans-serif;font-size:7pt;color:#999;' +
    'display:flex;justify-content:space-between;align-items:center;padding:2mm 20mm 0;' +
    'border-top:0.3pt solid #e5e5e5">' +
    '<span>Vizzio &middot; ' + esc(getLastUpdated().monthYear) + '</span>' +
    '<span style="font-weight:600"><span class="pageNumber"></span> / ' +
    '<span class="totalPages"></span></span></div>'
  )
}

function getSlugsInOrder(): string[] {
  const docsPath = path.join(process.cwd(), 'content/docs')
  return fs
    .readdirSync(docsPath)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(docsPath, f), 'utf8')
      const m = raw.match(/^order:\s*(\d+)/m)
      return { slug: f.replace('.mdx', ''), order: m ? parseInt(m[1], 10) : 99 }
    })
    .sort((a, b) => a.order - b.order)
    .map((f) => f.slug)
}

async function launchBrowser() {
  if (process.env.VERCEL === '1') {
    // @sparticuz/chromium picks its bundled system libs from this at import time.
    // Node 24 has no profile it recognises, so force the AL2023 (22.x) lib set.
    process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs22.x'
    const chromium = await import('@sparticuz/chromium-min')
    const puppeteer = await import('puppeteer-core')
    return puppeteer.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(CHROMIUM_URL),
      headless: true,
    })
  }
  const puppeteer = await import('puppeteer-core')
  const local =
    process.env.CHROME_PATH ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return puppeteer.default.launch({
    executablePath: local,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
}

async function renderPage(
  browser: Awaited<ReturnType<typeof launchBrowser>>,
  url: string,
  canvasBudgetMs: number,
): Promise<Buffer> {
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.addStyleTag({ content: CSS })
    await page.waitForSelector('article', { timeout: 15000 }).catch(() => {})
    await page.evaluateHandle('document.fonts.ready')

    // DocImage paints images onto canvases client-side. Wait until they are drawn.
    await page.evaluate(async (budget: number) => {
      window.scrollTo(0, document.body.scrollHeight)
      await new Promise((r) => setTimeout(r, 300))
      window.scrollTo(0, 0)
      const isBlank = (c: HTMLCanvasElement): boolean => {
        try {
          if (!c.width || !c.height) return true
          const ctx = c.getContext('2d')
          if (!ctx) return false
          const w = Math.min(c.width, 64)
          const h = Math.min(c.height, 64)
          const d = ctx.getImageData(0, 0, w, h).data
          for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false
          return true
        } catch {
          return false
        }
      }
      const start = Date.now()
      const deadline = start + budget
      for (;;) {
        const cs = Array.from(document.querySelectorAll('canvas')) as HTMLCanvasElement[]
        if (cs.length > 0 && cs.every((c) => !isBlank(c))) break
        if (cs.length === 0 && Date.now() - start > 1500) break
        if (Date.now() > deadline) break
        await new Promise((r) => setTimeout(r, 200))
      }
    }, canvasBudgetMs)

    // printToPDF can fail transiently when the renderer is under memory
    // pressure. One retry after a short pause recovers most of those.
    let pdf: Uint8Array | undefined
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        pdf = await page.pdf({
          format: 'A4',
          scale: 0.8,
          printBackground: true,
          margin: { top: '25mm', right: '20mm', bottom: '22mm', left: '20mm' },
          displayHeaderFooter: true,
          headerTemplate: header(),
          footerTemplate: footer(),
        })
        break
      } catch (e) {
        if (attempt === 1) throw e
        console.warn('printToPDF retry for ' + url, e)
        await new Promise((r) => setTimeout(r, 1500))
      }
    }
    return Buffer.from(pdf as Uint8Array)
  } finally {
    await page.close().catch(() => {})
  }
}

export async function GET(request: NextRequest) {
  const started = Date.now()
  const { searchParams } = new URL(request.url)
  const full = searchParams.get('full') === 'true'
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const baseUrl = origin.replace(/\/$/, '') + BASE_PATH

  let browser: Awaited<ReturnType<typeof launchBrowser>> | undefined
  try {
    browser = await launchBrowser()

    if (!full) {
      const slugs = getSlugsInOrder()
      const requested = searchParams.get('slug')
      const slug = requested && slugs.includes(requested) ? requested : slugs[0]
      if (!slug) return new NextResponse('No documents found', { status: 404 })

      const buf = await renderPage(browser, baseUrl + '/docs/' + slug, 6000)
      return new NextResponse(buf as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition':
            'attachment; filename="' + PDF_PREFIX + '-' + slug + '.pdf"',
        },
      })
    }

    const slugs = getSlugsInOrder()
    const buffers: Buffer[] = []
    let truncated = false
    let sinceRestart = 0

    for (const s of slugs) {
      if (Date.now() - started > BUDGET_MS) {
        console.warn('PDF budget reached after ' + buffers.length + '/' + slugs.length + ' pages')
        truncated = true
        break
      }

      // Chromium leaks across renders on image-heavy pages until the renderer
      // dies mid-print. A fresh browser every few pages keeps usage flat.
      if (sinceRestart >= PAGES_PER_BROWSER) {
        await browser.close().catch(() => {})
        browser = await launchBrowser()
        sinceRestart = 0
      }

      try {
        buffers.push(await renderPage(browser, baseUrl + '/docs/' + s, 4000))
        sinceRestart++
      } catch (e) {
        // One bad page must not lose the whole document. Restart before the next.
        console.error('PDF page failed: ' + s, e)
        truncated = true
        await browser.close().catch(() => {})
        browser = await launchBrowser()
        sinceRestart = 0
      }
    }

    if (buffers.length === 0) {
      return new NextResponse('No pages could be rendered', { status: 500 })
    }

    const merged = await PDFDocument.create()
    for (const buf of buffers) {
      const doc = await PDFDocument.load(buf)
      const pages = await merged.copyPages(doc, doc.getPageIndices())
      pages.forEach((p) => merged.addPage(p))
    }

    return new NextResponse(Buffer.from(await merged.save()) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename="' + PDF_PREFIX + '-Documentation.pdf"',
        'X-Pages-Rendered': String(buffers.length) + '/' + String(slugs.length),
        'X-Truncated': String(truncated),
      },
    })
  } catch (err) {
    console.error('PDF error:', err)
    return new NextResponse(String(err), { status: 500 })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}
