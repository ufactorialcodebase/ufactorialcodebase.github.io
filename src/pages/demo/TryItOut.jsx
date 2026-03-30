import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode } from '../../lib/api/index.js';
import { useAuth } from '../../hooks/useAuth';

/**
 * "Try It Out" demo page - fresh start experience
 * Accessible via access code OR authenticated Supabase session
 */
export default function TryItOut() {
  const navigate = useNavigate();
  const { session, initialized, refreshSubscription } = useAuth();

  const [toast, setToast] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for access code or auth session on mount
  useEffect(() => {
    if (!initialized) return;
    if (!getAccessCode() && !session) {
      navigate('/signup');
    }
  }, [navigate, session, initialized]);

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'success') {
      setToast('Welcome to Premium! 🎉')
      refreshSubscription?.()
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
      setTimeout(() => setToast(null), 5000)
    } else if (checkout === 'canceled') {
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, refreshSubscription])

  const handleExit = () => {
    navigate('/demo');
  };
  
  return (
    <>
    {toast && (
      <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium shadow-lg">
        {toast}
      </div>
    )}
    <Chat
      mode="try_it_out"
      onExit={handleExit}
      suggestedPrompts={[
        "My brother Jack lives in Boston",
        "I'm planning a dinner party next Saturday",
        "I need to remember to call mom about the holiday plans",
        "My wife Sarah is vegetarian",
        "I have a meeting with Dr. Smith next Tuesday",
      ]}
    />
    </>
  );
}
