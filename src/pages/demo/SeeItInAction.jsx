import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../../components/demo/Chat';
import { getAccessCode } from '../../lib/api/index.js';

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
    "How's the move to Phoenix going?",
    "What do I still need to do before the baby arrives?",
    "Tell me about the Japan trip — that was amazing",
    "What's coming up this month?",
    "I'm feeling nostalgic about SF",
  ];
  
  return (
    <Chat 
      mode="alex"
      onExit={handleExit}
      suggestedPrompts={alexPrompts}
    />
  );
}
