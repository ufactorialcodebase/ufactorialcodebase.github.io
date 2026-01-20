import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode } from '../../lib/api';

/**
 * "See It In Action" demo page - Alex persona with rich context
 */
export default function SeeItInAction() {
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
  
  // Alex-specific prompts that showcase rich context retrieval
  const alexPrompts = [
    "Planning dinner with the team this weekend",
    "How's the Japan trip planning going?",
    "Need to talk to Mike about the roadmap",
    "Sarah's birthday is coming up",
    "What was I stressed about recently?",
  ];
  
  return (
    <Chat 
      mode="alex"
      onExit={handleExit}
      suggestedPrompts={alexPrompts}
    />
  );
}
