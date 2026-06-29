// e2e/verify-data-privacy.js
//
// Verifies the Settings "Data & Privacy" rewrite + the new Contact-page
// data-requests section. No LLM cost — pure DOM assertions + screenshots.
//
// Usage:
//   node e2e/verify-data-privacy.js
//
// Env (optional):
//   APP_URL      default http://localhost:5174
//   STATE_FILE   default /tmp/hridai-e2e-state.json
//   OUT_DIR      default /tmp/hridai-e2e

import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const APP_URL = process.env.APP_URL || 'http://localhost:5174'
const STATE_FILE = process.env.STATE_FILE || '/tmp/hridai-e2e-state.json'
const OUT_DIR = process.env.OUT_DIR || '/tmp/hridai-e2e'

if (!fs.existsSync(STATE_FILE)) {
  console.error(`Auth state not found at ${STATE_FILE}. Run e2e/auth-bootstrap.js first.`)
  process.exit(1)
}
fs.mkdirSync(OUT_DIR, { recursive: true })

function pass(msg) { console.log(`  ✓ ${msg}`) }
function fail(msg) { console.error(`  ✗ FAIL: ${msg}`); process.exitCode = 1 }

;(async () => {
  console.log(`Verifying Settings + Contact at ${APP_URL}`)
  console.log(`Screenshots → ${OUT_DIR}/`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1440, height: 900 },
  })

  // Match verify.js: flag on + beta modal dismissed (Profile renders SettingsHome
  // when vault_redesign is on).
  await ctx.addInitScript(() => {
    localStorage.setItem('hridai_features', JSON.stringify({ vault_redesign: true }))
    localStorage.setItem('hridai_beta_acknowledged', 'true')
  })

  const page = await ctx.newPage()
  const report = { url: APP_URL, started_at: new Date().toISOString(), checks: {} }

  try {
    // -------- /vault/profile — Settings Data & Privacy --------
    console.log('\n[1/3] /vault/profile — Data & Privacy section')
    await page.goto(`${APP_URL}/vault/profile`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForSelector('main', { timeout: 15_000 })
    await page.waitForTimeout(2_000)  // hydrate

    const settings = await page.evaluate(() => {
      // Find the section labelled "Data & Privacy" by its label header text.
      const headers = Array.from(document.querySelectorAll('div, h2, h3, span'))
      const dpHeader = headers.find(el => (el.textContent || '').trim() === 'Data & Privacy')
      // The header sits above the section card; walk up to its parent that contains the rows.
      const section = dpHeader?.parentElement
      const sectionText = section?.innerText || ''
      const links = Array.from(section?.querySelectorAll('a[href]') || []).map(a => ({
        href: a.getAttribute('href'),
        label: (a.textContent || '').trim().slice(0, 80),
      }))
      const allAnchors = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'))
      return {
        sectionFound: Boolean(dpHeader),
        sectionText: sectionText.slice(0, 400),
        sectionLinks: links,
        hasExportLink: allAnchors.includes('/contact#export-data'),
        hasDeleteLink: allAnchors.includes('/contact#delete-account'),
        anyComingSoon: document.body.innerText.includes('Coming soon'),
      }
    })
    report.checks.settings = settings
    console.log(`    sectionText="${settings.sectionText.replace(/\s+/g, ' ').slice(0, 200)}…"`)
    console.log(`    sectionLinks=${JSON.stringify(settings.sectionLinks)}`)

    if (settings.hasExportLink) pass('href="/contact#export-data" present on page')
    else fail('href="/contact#export-data" not found')

    if (settings.hasDeleteLink) pass('href="/contact#delete-account" present on page')
    else fail('href="/contact#delete-account" not found')

    if (!settings.anyComingSoon) pass('no "Coming soon" text anywhere on settings')
    else fail('"Coming soon" still present somewhere on settings — old badges may not be fully removed')

    if (!/Delete my data/i.test(settings.sectionText) && /Delete my account & data/i.test(settings.sectionText)) {
      pass('Delete row uses combined "Delete my account & data" label')
    } else {
      fail(`Combined delete label not found. Section text contains: ${settings.sectionText.slice(0, 300)}`)
    }

    await page.screenshot({ path: path.join(OUT_DIR, 'settings-data-privacy.png'), fullPage: true })

    // -------- /contact (no hash) — full page baseline --------
    console.log('\n[2/3] /contact — data requests section structure')
    await page.goto(`${APP_URL}/contact`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.waitForSelector('h1', { timeout: 10_000 })
    await page.waitForTimeout(1_000)

    const contactStructure = await page.evaluate(() => {
      const exportEl = document.getElementById('export-data')
      const deleteEl = document.getElementById('delete-account')
      const exportMailto = exportEl?.querySelector('a[href^="mailto:"]')?.getAttribute('href') || null
      const deleteMailto = deleteEl?.querySelector('a[href^="mailto:"]')?.getAttribute('href') || null
      const otherInquiriesHeading = Array.from(document.querySelectorAll('h2'))
        .find(h => /Other inquiries/i.test(h.textContent || ''))
      return {
        exportSectionPresent: Boolean(exportEl),
        deleteSectionPresent: Boolean(deleteEl),
        exportMailto,
        deleteMailto,
        exportButtonText: exportEl?.querySelector('a[href^="mailto:"]')?.textContent?.trim() || null,
        deleteButtonText: deleteEl?.querySelector('a[href^="mailto:"]')?.textContent?.trim() || null,
        otherInquiriesSectionPresent: Boolean(otherInquiriesHeading),
        existingInquiryCount: document.querySelectorAll('a[href^="mailto:support@ufactorial.com"], a[href^="mailto:privacy@ufactorial.com"], a[href^="mailto:legal@ufactorial.com"], a[href^="mailto:abuse@ufactorial.com"], a[href^="mailto:security@ufactorial.com"]').length,
      }
    })
    report.checks.contact_structure = contactStructure
    console.log(`    structure=${JSON.stringify(contactStructure, null, 2).split('\n').slice(0, 20).join(' ')}`)

    if (contactStructure.exportSectionPresent) pass('<section id="export-data"> present')
    else fail('<section id="export-data"> missing')

    if (contactStructure.deleteSectionPresent) pass('<section id="delete-account"> present')
    else fail('<section id="delete-account"> missing')

    if (contactStructure.exportMailto?.startsWith('mailto:contactus@ufactorial.com')) pass(`export mailto = contactus@ufactorial.com`)
    else fail(`export mailto bad: ${contactStructure.exportMailto}`)

    if (contactStructure.deleteMailto?.startsWith('mailto:contactus@ufactorial.com')) pass(`delete mailto = contactus@ufactorial.com`)
    else fail(`delete mailto bad: ${contactStructure.deleteMailto}`)

    if (contactStructure.otherInquiriesSectionPresent) pass('"Other inquiries" heading still present (existing cards preserved)')
    else fail('"Other inquiries" heading missing')

    if (contactStructure.existingInquiryCount >= 5) pass(`${contactStructure.existingInquiryCount} existing inquiry cards preserved`)
    else fail(`only ${contactStructure.existingInquiryCount} existing inquiry cards found (expected ≥5)`)

    await page.screenshot({ path: path.join(OUT_DIR, 'contact-full.png'), fullPage: true })

    // -------- /contact#export-data — hash scroll lands on right card --------
    console.log('\n[3/3] Hash scroll: /contact#export-data + /contact#delete-account')

    for (const anchor of ['export-data', 'delete-account']) {
      await page.goto(`${APP_URL}/contact#${anchor}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await page.waitForSelector(`#${anchor}`, { timeout: 10_000 })
      await page.waitForTimeout(1_200)  // allow smooth scroll to settle
      const scrollInfo = await page.evaluate((id) => {
        const el = document.getElementById(id)
        if (!el) return { error: 'element missing' }
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        return {
          topOffset: Math.round(rect.top),
          inViewport: rect.top >= 0 && rect.top < vh && rect.bottom > 0,
          windowScrollY: Math.round(window.scrollY),
        }
      }, anchor)
      report.checks[`hash_${anchor}`] = scrollInfo
      console.log(`    #${anchor}: topOffset=${scrollInfo.topOffset}px  scrollY=${scrollInfo.windowScrollY}  inViewport=${scrollInfo.inViewport}`)

      if (scrollInfo.inViewport) pass(`#${anchor} scrolled into viewport`)
      else fail(`#${anchor} NOT in viewport after hash navigation (topOffset=${scrollInfo.topOffset}px)`)

      await page.screenshot({ path: path.join(OUT_DIR, `contact-hash-${anchor}.png`), fullPage: false })
    }
  } catch (err) {
    report.fatal = String(err)
    console.error(`\nFATAL: ${err.message}`)
    process.exitCode = 1
  } finally {
    await browser.close()
  }

  report.finished_at = new Date().toISOString()
  report.exit_code = process.exitCode || 0
  fs.writeFileSync(path.join(OUT_DIR, 'report-data-privacy.json'), JSON.stringify(report, null, 2))
  console.log(`\nReport: ${OUT_DIR}/report-data-privacy.json`)
  console.log(`Exit code: ${report.exit_code}`)
})().catch((err) => {
  console.error('Probe failed:', err)
  process.exit(1)
})
