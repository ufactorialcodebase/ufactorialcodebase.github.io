import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, KeyRound, Sparkles, Brain, CheckCircle } from 'lucide-react';
import { validateAccessCode, useAccessCode, setAccessCode, checkHealth } from '../../lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Access code entry page
 */
export default function CodeEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'ok', 'error'
  
  // Check API health on mount
  useEffect(() => {
    checkHealth().then(result => {
      setApiStatus(result.status === 'ok' ? 'ok' : 'error');
    });
  }, []);
  
  // Auto-submit if code in URL
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && apiStatus === 'ok') {
      handleSubmit(null, urlCode);
    }
  }, [searchParams, apiStatus]);
  
  const handleSubmit = async (e, prefilledCode = null) => {
    e?.preventDefault();
    const codeToUse = prefilledCode || code.trim().toUpperCase();
    
    if (!codeToUse) {
      setError('Please enter an access code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // First validate the code
    const validation = await validateAccessCode(codeToUse);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid access code');
      setIsLoading(false);
      return;
    }
    
    // Then use (activate) the code
    const activation = await useAccessCode(codeToUse);
    
    if (!activation.success) {
      setError(activation.error || 'Failed to activate code');
      setIsLoading(false);
      return;
    }
    
    // Store the code and navigate
    setAccessCode(codeToUse);
    
    // Navigate based on mode
    if (activation.mode === 'alex') {
      navigate('/demo/see-it-in-action');
    } else {
      navigate('/demo/try-it-out');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-5 shadow-xl shadow-slate-900/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome to HrdAI</h1>
          <p className="mt-3 text-slate-500">
            Enter your access code to explore the demo
          </p>
        </motion.div>
        
        {/* API Status Warning */}
        {apiStatus === 'error' && (
          <motion.div variants={fadeUp} className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800">API Unavailable</div>
                <div className="text-sm text-amber-700 mt-1">
                  Cannot connect to the HrdAI API. Please try again later or contact support.
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {apiStatus === 'checking' && (
          <motion.div variants={fadeUp} className="mb-6 p-5 rounded-xl bg-slate-100 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
            <div className="text-sm text-slate-500 mt-3">Connecting to API...</div>
          </motion.div>
        )}
        
        {apiStatus === 'ok' && (
          <motion.div variants={fadeUp} className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-emerald-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              API Connected
            </div>
          </motion.div>
        )}
        
        {/* Code Entry Form */}
        <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
              Access Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="DEMO-XXXX-XXXX"
                disabled={isLoading || apiStatus !== 'ok'}
                className={`
                  w-full pl-12 pr-4 py-4 rounded-xl border-2 text-lg font-mono tracking-wider
                  placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal
                  focus:outline-none focus:ring-0 transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${error 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'border-slate-200 bg-white focus:border-slate-400 hover:border-slate-300'
                  }
                `}
              />
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !code.trim() || apiStatus !== 'ok'}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
              font-semibold text-lg transition-all duration-150 shadow-lg
              ${isLoading || !code.trim() || apiStatus !== 'ok'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-slate-900/25'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                Enter Demo
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </motion.form>
        
        {/* Help text */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Don't have a code?{' '}
            <a href="/#footer" className="text-slate-800 font-medium underline underline-offset-2 hover:no-underline">
              Request access
            </a>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Demo codes expire after a limited number of sessions.
          </p>
        </motion.div>
        
        {/* Demo modes explanation */}
        <motion.div variants={fadeUp} className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-sm font-semibold text-slate-700 mb-4">Demo Modes</div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">TRY</span>
                  <span className="text-sm font-medium text-slate-700">Try It Yourself</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Fresh start - watch memory build as you chat</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">ALEX</span>
                  <span className="text-sm font-medium text-slate-700">See It In Action</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Pre-built persona - see rich context retrieval</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
