// Top-level React ErrorBoundary — a component crash inside <Routes> paints
// nothing (React tears down the subtree), and pre-launch the risk of a
// white-screen is worse than a slightly rough fallback. Renders a branded
// "something went wrong" card with a reload button.
//
// Kept intentionally class-based: React 19 still requires class components
// for componentDidCatch / getDerivedStateFromError. Hooks-based error
// boundaries do not exist as of React 19.

import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to devtools so we can trace crashes during launch week.
    // Not wired to a monitoring service yet — coordinator's call whether to
    // route to Sentry/Logtail later.
    console.error('ErrorBoundary caught:', error, info?.componentStack)
  }

  handleReload = () => {
    // Full reload — resets React state, re-runs auth init, re-fetches
    // greeting. Anything short of this risks re-entering the same crash.
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const message = this.props.fallbackMessage
      || 'Something went wrong. Please reload.'

    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white/80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {message}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            HridAI hit an unexpected error. A reload usually fixes it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
