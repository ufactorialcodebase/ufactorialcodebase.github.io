import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, KeyRound, Sparkles, Brain, CheckCircle, User } from 'lucide-react';
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
 * Unified access code entry page
 * One code grants access to both demo modes
 */
export default function CodeEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [enteringMode, setEnteringMode] = useState(null); // 'try' or 'simulated'
  const [error, setError] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'ok', 'error'
  
  // Check API health on mount
  useEffect(() => {
    checkHealth().then(result => {
      setApiStatus(result.status === 'ok' ? 'ok' : 'error');
    });
  }, []);
  
  // Debounced code validation
  const validateCode = useCallback(async (codeToValidate) => {
    if (!codeToValidate || codeToValidate.length < 8) {
      setIsCodeValid(false);
      return;
    }
    
    setIsValidating(true);
    setError('');
    
    const validation = await validateAccessCode(codeToValidate);
    
    setIsValidating(false);
    
    if (validation.valid) {
      setIsCodeValid(true);
      setError('');
    } else {
      setIsCodeValid(false);
      // Only show error if code looks complete (has dashes like DEMO-XXX-XXX)
      if (codeToValidate.includes('-') && codeToValidate.length >= 10) {
        setError(validation.error || 'Invalid access code');
      }
    }
  }, []);
  
  // Validate code when it changes (debounced)
  useEffect(() => {
    if (apiStatus !== 'ok') return;
    
    const timer = setTimeout(() => {
      validateCode(code.trim().toUpperCase());
    }, 500);
    
    return () => clearTimeout(timer);
  }, [code, apiStatus, validateCode]);
  
  // Handle entering a specific mode
  const handleEnterMode = async (mode) => {
    const codeToUse = code.trim().toUpperCase();
    
    if (!codeToUse || !isCodeValid) {
      setError('Please enter a valid access code');
      return;
    }
    
    setIsEntering(true);
    setEnteringMode(mode);
    setError('');
    
    if (mode === 'try') {
      // For "Try It Yourself", we need to activate the code
      const activation = await useAccessCode(codeToUse);
      
      if (!activation.success) {
        setError(activation.error || 'Failed to activate code');
        setIsEntering(false);
        setEnteringMode(null);
        return;
      }
    }
    
    // Store the code and navigate
    setAccessCode(codeToUse);
    
    if (mode === 'try') {
      navigate('/demo/try-it-out');
    } else {
      navigate('/demo/simulated');
    }
  };
  
  const isButtonDisabled = !isCodeValid || isEntering || apiStatus !== 'ok';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <motion.div 
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-3xl"
      >
        {/* Logo/Header */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-5 shadow-xl shadow-slate-900/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome to HridAI</h1>
          <p className="mt-3 text-slate-500">
            Enter your access code, then choose how you'd like to explore
          </p>
        </motion.div>
        
        {/* API Status */}
        {apiStatus === 'error' && (
          <motion.div variants={fadeUp} className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800">API Unavailable</div>
                <div className="text-sm text-amber-700 mt-1">
                  Cannot connect to the HridAI API. Please try again later.
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {apiStatus === 'checking' && (
          <motion.div variants={fadeUp} className="mb-6 p-4 rounded-xl bg-slate-100 text-center max-w-md mx-auto">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
            <div className="text-sm text-slate-500 mt-2">Connecting to API...</div>
          </motion.div>
        )}
        
        {/* Code Entry */}
        <motion.div variants={fadeUp} className="mb-8 max-w-md mx-auto">
          <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2 text-center">
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
                setIsCodeValid(false);
              }}
              placeholder="DEMO-XXXX-XXXX"
              disabled={apiStatus !== 'ok'}
              className={`
                w-full pl-12 pr-12 py-4 rounded-xl border-2 text-lg font-mono tracking-wider text-center
                placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal
                focus:outline-none focus:ring-0 transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error 
                  ? 'border-red-300 bg-red-50 focus:border-red-400' 
                  : isCodeValid
                    ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400'
                    : 'border-slate-200 bg-white focus:border-slate-400 hover:border-slate-300'
                }
              `}
            />
            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isValidating && (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              )}
              {!isValidating && isCodeValid && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          {isCodeValid && !error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-sm text-emerald-600 font-medium"
            >
              ✓ Code valid — choose a mode below
            </motion.div>
          )}
        </motion.div>
        
        {/* Two Mode Cards */}
        <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-6">
          {/* Try It Yourself */}
          <div className={`
            p-6 rounded-2xl border-2 transition-all duration-200
            ${isButtonDisabled 
              ? 'border-slate-200 bg-slate-50/50' 
              : 'border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-lg'
            }
          `}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                p-2.5 rounded-xl shadow-lg
                ${isButtonDisabled 
                  ? 'bg-slate-300 shadow-slate-300/25' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
                }
              `}>
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${isButtonDisabled ? 'text-slate-400' : 'text-slate-800'}`}>
                Try It Yourself
              </h2>
            </div>
            
            <button
              onClick={() => handleEnterMode('try')}
              disabled={isButtonDisabled}
              className={`
                w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                font-semibold transition-all duration-150 mb-4
                ${isButtonDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-500/25'
                }
              `}
            >
              {isEntering && enteringMode === 'try' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  Chat with your HridAI
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <p className={`text-sm ${isButtonDisabled ? 'text-slate-400' : 'text-slate-600'}`}>
              Start a new conversation or pick up where you left off. HridAI remembers you across sessions, so come back anytime and see how it grows with you.
            </p>
          </div>
          
          {/* Simulated Demo */}
          <div className={`
            p-6 rounded-2xl border-2 transition-all duration-200
            ${isButtonDisabled 
              ? 'border-slate-200 bg-slate-50/50' 
              : 'border-violet-200 bg-white hover:border-violet-300 hover:shadow-lg'
            }
          `}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                p-2.5 rounded-xl shadow-lg
                ${isButtonDisabled 
                  ? 'bg-slate-300 shadow-slate-300/25' 
                  : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/25'
                }
              `}>
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-lg font-bold ${isButtonDisabled ? 'text-slate-400' : 'text-slate-800'}`}>
                Simulated Demo
              </h2>
            </div>
            
            <button
              onClick={() => handleEnterMode('simulated')}
              disabled={isButtonDisabled}
              className={`
                w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                font-semibold transition-all duration-150 mb-4
                ${isButtonDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-violet-500/25'
                }
              `}
            >
              {isEntering && enteringMode === 'simulated' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  Choose a Persona
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <p className={`text-sm ${isButtonDisabled ? 'text-slate-400' : 'text-slate-600'}`}>
              Step into a persona's shoes and chat as them. See how HridAI surfaces relevant 
              context about their family, work, and goals without being asked.
            </p>
          </div>
        </motion.div>
        
        {/* Help text */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Don't have a code?{' '}
            <a href="/#waitlist" className="text-slate-700 font-medium underline underline-offset-2 hover:no-underline">
              Join the waitlist
            </a>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            One code works for both modes. Sessions are limited per code.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
