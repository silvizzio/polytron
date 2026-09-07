# polytron

Documentation site for POLYTRON.AI: the Polytron One platform user guide, and the
field procedures for 360 and DJI area scanning.

Built on the Vizzio `template-docs` scaffold. Next.js, MDX (next-mdx-remote),
Tailwind, deployed to Vercel and served at `https://www.vizzio.space/polytron`.

## Content structure

Pages live in `content/docs` as `NN-slug.mdx`. The sidebar and the section
grouping are derived from the frontmatter, so there is no nav file to maintain.

| Order | File | Section |
|---|---|---|
| 01 | `01-overview.mdx` | Getting started |
| 02 | `02-polytron-one-getting-started.mdx` | Polytron One |
| 03 | `03-cameras.mdx` | Polytron One |
| 04 | `04-live-view.mdx` | Polytron One |
| 05 | `05-playback.mdx` | Polytron One |
| 06 | `06-notifications.mdx` | Polytron One |
| 07 | `07-settings.mdx` | Polytron One |
| 08 | `08-indoor-congested-area.mdx` | Scanning Field Guides |
| 09 | `09-indoor-area.mdx` | Scanning Field Guides |
| 10 | `10-outdoor-area.mdx` | Scanning Field Guides |
| 11 | `11-3d-reconstruction-mapping.mdx` | Scanning Field Guides |

Superseded template content sits in `content/_archive` and is not built.

### Frontmatter

```yaml
---
title: "Cameras"
order: 3
section: "Polytron One"
description: "One line, used for the page description."
---
```

`order` drives both the sidebar sequence and the prev/next links. `section`
creates the sidebar group; sections appear in the order of their lowest `order`
value. Renumbering a page means renaming its file too, since the filename stem
is the URL slug.

## Images

Source images live in `private/images/docs`, flat, named to match their page
prefix (`03-camera-add.png`). They are served through `/polytron/api/img/` by
`src/app/api/img/[...path]/route.ts`, not from `public`.

Reference them by bare filename in MDX:

```md
![The Add Camera dialog with the IP range scan](03-camera-add.png)
```

The `img` element is mapped to `DocImage`, which resolves the basename against
the API route. Alt text becomes the caption. An em dash splits it into a bold
title and a caption below it.

Supported extensions: `.jpg .jpeg .png .svg .webp`.

The first image in a page is also its cover on the landing page, resolved by
`getDocCover()` in `src/lib/docs.ts`. A page with no image falls back to a
gradient.

### Image watcher

`tools/watch_images.py` converts PNGs dropped into `raw-images/` and writes them
into `private/images/docs`. See `tools/WATCH-README.md`.

## Video

The four capture-cycle clips are H.264 MP4 in `public/video`, referenced with an
absolute path that includes the basePath:

```jsx
<video controls loop muted playsInline preload="metadata"
  src="/polytron/video/08-congested-walk-pause-cycle.mp4" />
```

These arrived from Notion as GIFs of 46 to 102 MB. GitHub rejects any file over
100 MB, so they must be converted before commit:

```bash
ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p \
  -vf "scale='min(1280,iw)':-2" -r 20 \
  -c:v libx264 -crf 30 -preset slow -an output.mp4
```

That takes 291 MB of GIF down to about 14 MB. Video does not render in the PDF
export, which uses headless Chromium.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000/polytron. The site is scoped under `/polytron` by
`basePath` in `next.config.ts`; the bare root redirects there.

After renaming or renumbering pages, clear the route cache:

```bash
rm -rf .next && npm run dev
```

## Adding a page

1. Create `content/docs/NN-slug.mdx` with the frontmatter above.
2. Put its images in `private/images/docs` with a matching `NN-` prefix.
3. Add the page to the section list in `src/app/page.tsx` if it should appear on
   the landing page.

Internal links in MDX compile to plain anchors, so they need the basePath
written out:

```md
[Cameras](/polytron/docs/03-cameras)
```

Links in TSX use `next/link`, which applies the basePath itself, so those stay
relative (`/docs/03-cameras`).

## Deployment

Vercel project `polytron`, framework Next.js, no extra config.

Required environment variable (Production):NEXT_PUBLIC_BASE_URL = https://polytron.vercel.app 
The PDF route renders live pages with headless Chromium and needs a real origin.
Point it at the project's own `.vercel.app` domain, not `www.vizzio.space`, so
it does not fetch back through the proxy.

The `.vercel.app` domain stays live. `vizzio.space` rewrites to it:

```json
{ "source": "/polytron", "destination": "https://polytron.vercel.app/polytron" },
{ "source": "/polytron/:path*", "destination": "https://polytron.vercel.app/polytron/:path*" }
```

Both rules are needed; a single `:path*` rule misses the bare `/polytron` root.

## Source material

Content was imported from four Notion scanning field guides and the Polytron One
V1.5 user guide draft. Notion is no longer the source of truth; edit the MDX.
