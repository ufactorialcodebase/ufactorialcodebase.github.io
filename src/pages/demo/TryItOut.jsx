import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

/**
 * "Try It Out" demo page - fresh start experience
 * Accessible via access code OR authenticated Supabase session
 */
export default function TryItOut() {
  const navigate = useNavigate();
  const { session, initialized } = useAuth();

  // Check for access code or auth session on mount
  useEffect(() => {
    if (!initialized) return;
    if (!getAccessCode() && !session) {
      navigate('/signup');
    }
  }, [navigate, session, initialized]);

  const handleExit = () => {
    navigate('/demo');
  };
  
  return (
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
  );
}
