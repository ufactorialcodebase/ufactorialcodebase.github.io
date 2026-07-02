// e2e/mock-graph-labels.js
//
// Renders a self-contained side-by-side mock (warm vs dark) of the World
// force-graph label styling and screenshots it. No auth needed — loads a
// local HTML file that exercises the same CSS var machinery the app uses
// (--graph-label-color / --graph-label-shadow with the same fallback
// values ForceGraph.jsx uses inline).
//
// Purpose: quick visual regression for the label-color fix without going
// through the full app (auth state may not be present locally).
//
// Usage:
//   node e2e/mock-graph-labels.js

import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HTML = 'file://' + path.resolve(__dirname, 'graph-label-mock.html')
const OUT = '/tmp/hridai-e2e/graph-label-mock.png'

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 550 } })
  const page = await ctx.newPage()
  await page.goto(HTML, { waitUntil: 'load' })
  await page.waitForTimeout(300)  // let fonts settle
  await page.screenshot({ path: OUT, fullPage: false })
  await browser.close()
  console.log('Wrote', OUT)
})().catch((err) => {
  console.error('Mock probe failed:', err)
  process.exit(1)
})
