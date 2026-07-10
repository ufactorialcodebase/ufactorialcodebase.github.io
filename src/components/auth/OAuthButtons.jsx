import { supabase } from '../../lib/supabase'

// Official Google "G" mark, per Google's brand guidelines (four-color logo,
// not a hand-rolled recolor).
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.96 10.71A5.4 5.4 0 013.68 9c0-.6.1-1.18.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  )
}

export default function OAuthButtons({ disabled = false }) {
  const handleGoogleSignIn = async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-white text-gray-800 font-medium border border-white/10 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  )
}
