import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp, signIn, signInWithMagicLink, resetPassword } from '../lib/auth'
import { validateAccessCode } from '../lib/api/index.js'

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('signup') // 'signup' | 'login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {tab === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-white/60 mt-2">
            {tab === 'signup'
              ? 'Access code required for early access.'
              : 'Sign in to continue to HridAI.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-white/5 p-1 mb-6">
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'signup'
                ? 'bg-emerald-600 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Create account
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === 'login'
                ? 'bg-emerald-600 text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            Sign in
          </button>
        </div>

        {tab === 'signup' ? (
          <SignupForm onSuccess={() => setTab('login')} />
        ) : (
          <LoginForm onSuccess={() => navigate('/hridai')} />
        )}

        <p className="mt-6 text-center text-xs text-white/30">
          By using HridAI, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-white/50">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

function SignupForm({ onSuccess }) {
  const [accessCode, setAccessCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [codeValid, setCodeValid] = useState(null) // null = not checked, true/false

  const handleCodeBlur = async () => {
    if (!accessCode.trim()) { setCodeValid(null); return }
    const result = await validateAccessCode(accessCode.trim().toUpperCase())
    setCodeValid(result.valid)
    if (!result.valid) {
      setError(result.error || 'Invalid access code')
    } else {
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await signUp(email, password, accessCode.trim().toUpperCase())
      setMessage('Account created! You can now sign in.')
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="access-code" className="block text-sm text-white/60 mb-1">Access Code</label>
        <input id="access-code" type="text" value={accessCode}
          onChange={(e) => { setAccessCode(e.target.value.toUpperCase()); setCodeValid(null); setError(null) }}
          onBlur={handleCodeBlur}
          required className={`w-full px-4 py-3 rounded-lg bg-white/5 text-white border font-mono tracking-wider text-center placeholder:font-sans placeholder:tracking-normal focus:outline-none transition-colors ${
            codeValid === true ? 'border-emerald-500' : codeValid === false ? 'border-red-400' : 'border-white/10 focus:border-emerald-500'
          }`} placeholder="DEMO-XXXX-XXXX" />
      </div>
      <div>
        <label htmlFor="signup-email" className="block text-sm text-white/60 mb-1">Email</label>
        <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm text-white/60 mb-1">Password</label>
        <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required minLength={8} className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="At least 8 characters" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {message && <p className="text-emerald-400 text-sm">{message}</p>}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors">
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-white/40">
        Don't have a code?{' '}
        <a href="/#waitlist" className="text-emerald-400 hover:underline">Join the waitlist</a>
      </p>
    </form>
  )
}

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await signIn(email, password)
      // Use full page navigation so auth state re-initializes from Supabase session
      window.location.href = '/vault/chat'
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first.'); return }
    setError(null)
    setLoading(true)
    try {
      await signInWithMagicLink(email)
      setMessage('Magic link sent! Check your email.')
    } catch (err) {
      setError(err.message || 'Failed to send magic link.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first.'); return }
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Password reset link sent! Check your email.')
    } catch (err) {
      setError(err.message || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm text-white/60 mb-1">Email</label>
          <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm text-white/60 mb-1">Password</label>
          <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="Your password" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-emerald-400 text-sm">{message}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button onClick={handleMagicLink} disabled={loading}
        className="w-full mt-3 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-50 transition-colors">
        Send magic link instead
      </button>

      <div className="mt-4 text-center">
        <button onClick={handleForgotPassword} disabled={loading}
          className="text-sm text-white/40 hover:text-emerald-400 transition-colors">
          Forgot your password?
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-white/40">
        Have an access code for the demo?{' '}
        <a href="/demo" className="text-emerald-400 hover:underline">Enter code</a>
      </p>
    </>
  )
}
