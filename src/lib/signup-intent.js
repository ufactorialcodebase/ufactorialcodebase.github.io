// src/lib/signup-intent.js
//
// Carries the access code + consent the user provided on /signup across the
// Google OAuth redirect. sessionStorage survives the same-tab round trip to
// Google and back to /auth/callback, where the stash lets AuthCallback finish
// signup without asking for the code or consent a second time.
//
// Consent is only ever stashed together with the code, and only after both
// checkboxes were checked on /signup — the OAuth button is disabled until
// then — so a present stash IS the consent record trigger.

const CODE_KEY = 'hridai_pending_signup_code'
const CONSENT_KEY = 'hridai_pending_signup_consent'

export function stashSignupIntent(code) {
  sessionStorage.setItem(CODE_KEY, code)
  sessionStorage.setItem(CONSENT_KEY, 'true')
}

export function readSignupIntent() {
  const code = sessionStorage.getItem(CODE_KEY)
  const consented = sessionStorage.getItem(CONSENT_KEY) === 'true'
  if (!code || !consented) return null
  return { code }
}

export function clearSignupIntent() {
  sessionStorage.removeItem(CODE_KEY)
  sessionStorage.removeItem(CONSENT_KEY)
}
