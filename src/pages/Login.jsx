import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signInWithMagicLink } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
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
      navigate('/demo/try-it-out')
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-white/60 mb-8">Sign in to continue to HridAI.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white/60 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white/60 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="Your password" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 text-sm">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors">
            {loading ? '...' : 'Sign in'}
          </button>
        </form>

        <button onClick={handleMagicLink} disabled={loading}
          className="w-full mt-3 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-50 transition-colors">
          Send magic link instead
        </button>

        <div className="mt-6 text-center text-sm text-white/40 space-y-2">
          <p>Don't have an account? <Link to="/signup" className="text-emerald-400 hover:underline">Sign up</Link></p>
          <p>Have an access code? <Link to="/demo" className="text-emerald-400 hover:underline">Enter code</Link></p>
        </div>
      </div>
    </div>
  )
}
