import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, User, Sparkles, Lock, ChevronRight } from 'lucide-react';
import { getAccessCode } from '../../lib/api';

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
 * Persona data - matches demo_personas table in Supabase
 * In production, this could be fetched from API
 */
const PERSONAS = [
  {
    id: 'alex',
    name: 'Alex Chen',
    bio: 'Product Manager at a tech startup, balancing ambitious career goals with family life and personal wellness.',
    relationships: [
      { name: 'Sarah', relationship: 'Wife', note: 'works at Spotify' },
      { name: 'Max', relationship: 'Son', note: 'loves dinosaurs' },
      { name: 'Mike', relationship: 'Colleague', note: 'engineering lead' },
      { name: 'Jessica', relationship: 'Boss', note: 'VP of Product' },
    ],
    topics: ['Japan trip planning', 'Half marathon training', 'Work-life balance', 'Team management'],
    isAvailable: true,
    gradient: 'from-violet-500 to-indigo-600',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    id: 'maya',
    name: 'Maya Rodriguez',
    bio: 'Freelance designer who recently relocated to a new city, building her client base while exploring her new home.',
    relationships: [],
    topics: ['Client management', 'New city exploration', 'Work-life balance'],
    isAvailable: false,
    gradient: 'from-rose-500 to-pink-600',
    shadowColor: 'shadow-rose-500/25',
  },
  {
    id: 'jordan',
    name: 'Jordan Park',
    bio: 'Parent of two young kids, navigating a career change while managing family logistics.',
    relationships: [],
    topics: ['Career transition', 'Family logistics', 'Learning new skills'],
    isAvailable: false,
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/25',
  },
];

/**
 * Persona card component
 */
function PersonaCard({ persona, onSelect }) {
  const isAvailable = persona.isAvailable;
  
  return (
    <motion.div
      variants={fadeUp}
      className={`
        relative rounded-2xl border bg-white p-6 transition-all duration-200
        ${isAvailable 
          ? 'border-slate-200 hover:border-slate-300 hover:shadow-lg cursor-pointer' 
          : 'border-slate-100 bg-slate-50/50 cursor-not-allowed'
        }
      `}
      onClick={() => isAvailable && onSelect(persona)}
    >
      {/* Coming Soon Badge */}
      {!isAvailable && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
          <Lock className="w-3 h-3" />
          Coming Soon
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`
          p-3 rounded-xl bg-gradient-to-br ${persona.gradient} text-white 
          shadow-lg ${persona.shadowColor}
          ${!isAvailable && 'opacity-40'}
        `}>
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${isAvailable ? 'text-slate-800' : 'text-slate-400'}`}>
            {persona.name}
          </h3>
          <p className={`text-sm mt-1 ${isAvailable ? 'text-slate-600' : 'text-slate-400'}`}>
            {persona.bio}
          </p>
        </div>
      </div>
      
      {/* Relationships */}
      {persona.relationships.length > 0 && (
        <div className="mb-4">
          <div className={`text-xs font-medium mb-2 ${isAvailable ? 'text-slate-500' : 'text-slate-400'}`}>
            Key Relationships
          </div>
          <div className="flex flex-wrap gap-2">
            {persona.relationships.slice(0, 4).map((rel, i) => (
              <span 
                key={i}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium
                  ${isAvailable 
                    ? 'bg-violet-50 text-violet-700' 
                    : 'bg-slate-100 text-slate-400'
                  }
                `}
              >
                {rel.name} <span className="opacity-60">({rel.relationship}{rel.note ? ` · ${rel.note}` : ''})</span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Topics */}
      <div className="mb-4">
        <div className={`text-xs font-medium mb-2 ${isAvailable ? 'text-slate-500' : 'text-slate-400'}`}>
          Active Topics
        </div>
        <div className="flex flex-wrap gap-2">
          {persona.topics.slice(0, 4).map((topic, i) => (
            <span 
              key={i}
              className={`
                px-2.5 py-1 rounded-full text-xs
                ${isAvailable 
                  ? 'bg-slate-100 text-slate-600' 
                  : 'bg-slate-50 text-slate-400'
                }
              `}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
      
      {/* CTA */}
      {isAvailable && (
        <div className="flex items-center justify-end text-sm font-medium text-violet-600 group-hover:text-violet-700">
          Chat as {persona.name.split(' ')[0]}
          <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Persona selection page for simulated demo
 */
export default function PersonaSelection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for access code on mount
  useEffect(() => {
    if (!getAccessCode()) {
      navigate('/demo');
    }
  }, [navigate]);
  
  const handleSelectPersona = async (persona) => {
    setIsLoading(true);
    
    // Store selected persona in session storage
    sessionStorage.setItem('hrdai_persona_id', persona.id);
    sessionStorage.setItem('hrdai_persona_name', persona.name);
    
    // Navigate to chat
    navigate('/demo/simulated/chat');
  };
  
  const handleBack = () => {
    navigate('/demo');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Simulated Demo</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Title */}
          <motion.div variants={fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-5 shadow-xl shadow-violet-500/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Choose a Persona
            </h1>
            <p className="mt-3 text-slate-600 max-w-lg mx-auto">
              Experience how HrdAI surfaces relevant context from past conversations. 
              Select a persona to chat as them and see their memories in action.
            </p>
          </motion.div>
          
          {/* Info banner */}
          <motion.div 
            variants={fadeUp}
            className="mb-8 p-4 rounded-xl bg-violet-50 border border-violet-100"
          >
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-violet-800">
                <strong>How it works:</strong> Each persona has a rich conversation history. 
                When you chat as them, the AI will recall their past discussions, relationships, 
                and ongoing topics. Your session resets when you exit, so the next visitor 
                gets the same experience.
              </div>
            </div>
          </motion.div>
          
          {/* Persona cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAS.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={handleSelectPersona}
              />
            ))}
          </div>
          
          {/* Footer note */}
          <motion.p 
            variants={fadeUp}
            className="text-center text-xs text-slate-400 mt-8"
          >
            More personas coming soon. Each with unique life contexts and conversation histories.
          </motion.p>
        </motion.div>
      </main>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-600">Loading persona...</p>
          </div>
        </div>
      )}
    </div>
  );
}
