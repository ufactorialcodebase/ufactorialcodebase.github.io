import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode } from '../../lib/api';

/**
 * "Try It Out" demo page - fresh start experience
 */
export default function TryItOut() {
  const navigate = useNavigate();
  
  // Check for access code on mount
  useEffect(() => {
    if (!getAccessCode()) {
      navigate('/demo');
    }
  }, [navigate]);
  
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
