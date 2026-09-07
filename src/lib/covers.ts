import fs from 'fs'
import path from 'path'

const DOCS_PATH = path.join(process.cwd(), 'content/docs')
const IMAGE_RE = /!\[[^\]]*\]\(([^)\s]+)\)/

let cached: Record<string, string> | null = null

// First image referenced in each doc, as a served URL. Used for landing page
// covers so they follow the content instead of being maintained by hand.
export function getCovers(): Record<string, string> {
  if (cached) return cached
  const out: Record<string, string> = {}
  try {
    const files = fs.readdirSync(DOCS_PATH).filter(f => f.endsWith('.mdx'))
    for (const file of files) {
      const raw = fs.readFileSync(path.join(DOCS_PATH, file), 'utf8')
      const body = raw.replace(/^---[\s\S]*?\n---/, '')
      const match = body.match(IMAGE_RE)
      if (!match) continue
      const filename = path.basename(match[1])
      if (!/\.(jpg|jpeg|png|svg|webp)$/i.test(filename)) continue
      out[file.replace(/\.mdx$/, '')] = `/polytron/api/img/${filename}`
    }
  } catch {
    // leave the map empty; callers fall back to the placeholder
  }
  cached = out
  return cached
}
