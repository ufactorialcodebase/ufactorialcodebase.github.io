import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signUp } from '../lib/auth'

export default function Signup() {
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
      await signUp(email, password)
      setMessage('Account created! Check your email to confirm, then sign in.')
    } catch (err) {
      setError(err.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-white/60 mb-8">Start building your personal intelligence.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-white/60 mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-white/60 mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} className="w-full px-4 py-3 rounded-lg bg-white/5 text-white border border-white/10 focus:border-emerald-500 focus:outline-none" placeholder="At least 8 characters" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-emerald-400 text-sm">{message}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors">
            {loading ? '...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Sign in</Link>
        </p>

        <p className="mt-4 text-center text-xs text-white/30">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-white/50">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-white/50">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
