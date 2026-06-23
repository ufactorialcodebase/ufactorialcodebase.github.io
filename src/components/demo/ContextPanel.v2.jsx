import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  User,
  Users,
  Building2,
  MapPin,
  MessageSquare,
  Tag,
  Clock,
  Sparkles,
  Brain,
  Network,
  Heart,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import TopicCardV2 from './TopicCard.v2';

/**
 * Entity type configuration - colors and icons
 */
const ENTITY_TYPE_CONFIG = {
  person:       { icon: User,      bgClass: 'bg-[color:rgba(77,102,136,0.08)] border-[color:rgba(77,102,136,0.18)]', textClass: 'text-[color:#4d6688]', iconClass: 'text-[color:#4d6688]' },
  organization: { icon: Building2, bgClass: 'bg-[color:rgba(110,77,30,0.08)] border-[color:rgba(110,77,30,0.18)]', textClass: 'text-[color:#6e4d1e]', iconClass: 'text-[color:#6e4d1e]' },
  place:        { icon: MapPin,    bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]',  textClass: 'text-[color:#4f6b4f]', iconClass: 'text-[color:#4f6b4f]' },
  location:     { icon: MapPin,    bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]',  textClass: 'text-[color:#4f6b4f]', iconClass: 'text-[color:#4f6b4f]' },
  default:      { icon: Users,     bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]',    textClass: 'text-[color:#5b4c39]', iconClass: 'text-[color:#5b4c39]' },
};

/**
 * Topic status configuration
 */
const TOPIC_STATUS_CONFIG = {
  active:   { bgClass: 'bg-[color:rgba(79,107,79,0.08)] border-[color:rgba(79,107,79,0.18)]', textClass: 'text-[color:#4f6b4f]', icon: TrendingUp },
  resolved: { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]', icon: CheckCircle },
  pending:  { bgClass: 'bg-[color:rgba(160,119,59,0.08)] border-[color:rgba(160,119,59,0.18)]', textClass: 'text-[color:#a0773b]', icon: AlertCircle },
  default:  { bgClass: 'bg-[color:rgba(91,76,57,0.06)] border-[color:rgba(91,76,57,0.15)]', textClass: 'text-[color:#5b4c39]', icon: Tag },
};

/**
 * Get entity type configuration
 */
function getEntityConfig(entityType) {
  const type = (entityType || 'default').toLowerCase();
  return ENTITY_TYPE_CONFIG[type] || ENTITY_TYPE_CONFIG.default;
}

/**
 * Get topic status configuration
 */
function getTopicConfig(status) {
  const s = (status || 'default').toLowerCase();
  return TOPIC_STATUS_CONFIG[s] || TOPIC_STATUS_CONFIG.default;
}

/**
 * Collapsible section component
 */
function Section({ title, icon: Icon, children, defaultOpen = true, count, accentColor = 'black' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-slate-100 dark:border-slate-700 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
      >
        <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 text-left">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Badge component for signal tags
 */
function SignalBadge({ children, type = 'entity', icon: CustomIcon, confidence }) {
  const configs = {
    entity: {
      base: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-700',
    },
    topic: {
      base: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700',
    },
    emotion: {
      base: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      hover: 'hover:bg-rose-100 dark:hover:bg-rose-900 hover:border-rose-300 dark:hover:border-rose-700',
    },
    queryType: {
      base: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      hover: 'hover:bg-violet-100 dark:hover:bg-violet-900 hover:border-violet-300 dark:hover:border-violet-700',
    },
    strategy: {
      base: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      hover: 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
    },
    followup: {
      base: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      hover: 'hover:bg-amber-100 dark:hover:bg-amber-900 hover:border-amber-300 dark:hover:border-amber-700',
    },
    timeRef: {
      base: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
      hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:border-cyan-300 dark:hover:border-cyan-700',
    },
  };
  
  const config = configs[type] || configs.entity;
  
  // Opacity based on confidence (default to 1 if no confidence)
  const opacityStyle = confidence !== undefined 
    ? { opacity: Math.max(0.5, confidence) }
    : {};
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border transition-all duration-150 cursor-default
        ${config.base} ${config.hover}
      `}
      style={opacityStyle}
      title={confidence !== undefined ? `Confidence: ${(confidence * 100).toFixed(0)}%` : undefined}
    >
      {CustomIcon && <CustomIcon className="w-3 h-3" />}
      {children}
    </span>
  );
}

/**
 * Entity card in context panel
 */
function EntityCard({ entity }) {
  const config = getEntityConfig(entity.entity_type);
  const Icon = config.icon;
  
  return (
    <div className={`rounded-lg p-3 mb-2 last:mb-0 border ${config.bgClass} transition-all duration-150 hover:shadow-sm`}>
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md bg-white/60 dark:bg-white/10 ${config.iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.textClass} truncate`}>
              {entity.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded bg-white/60 dark:bg-white/10 ${config.textClass} font-medium`}>
              {entity.entity_type}
            </span>
          </div>
          {entity.relationship_to_self && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" />
              {entity.relationship_to_self}
            </div>
          )}
        </div>
      </div>
      {entity.attributes && Object.keys(entity.attributes).length > 0 && (
        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(entity.attributes).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-xs bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            ))}
            {Object.keys(entity.attributes).length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 px-2 py-0.5">
                +{Object.keys(entity.attributes).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Episode card in context panel
 */
function EpisodeCard({ episode }) {
  return (
    <div className="rounded-lg p-3 mb-2 last:mb-0 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 transition-all duration-150 hover:shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800">
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-md bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 mt-0.5">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {episode.summary}
          </p>
          {episode.created_at && (
            <div className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(episode.created_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Context debug panel showing retrieval information
 */
export default function ContextPanel({ retrievalTrace, isLoading }) {
  if (!retrievalTrace && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 dark:from-slate-800 to-slate-50 dark:to-slate-900 flex items-center justify-center">
            <Brain className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Context Panel</p>
          <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
            As you chat, relevant context<br />will appear here
          </p>
        </div>
      </div>
    );
  }
  
  const { signals, entities_retrieved, topics_retrieved, episodes_retrieved } =
    retrievalTrace || {};
  
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 z-10 shadow-sm dark:shadow-slate-950/50 lg:pt-3 pt-14">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Network className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Context</span>
            {signals?.entities?.length || signals?.topics?.length ? (
              <p className="text-xs text-[var(--text-tertiary)] truncate">
                pulled context for: {[
                  ...(signals.entities || []).map(e => typeof e === 'string' ? e : e.name || ''),
                  ...(signals.topics || []).map(t => typeof t === 'string' ? t : t.name || ''),
                ].filter(Boolean).slice(0, 4).join(' · ')}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)]">Recent threads, people, and moments — switches as you talk.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-100 dark:from-violet-900 to-indigo-100 dark:to-indigo-900 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Retrieving context...</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Analyzing your message</p>
        </div>
      )}
      
      {/* Retrieved entities */}
      {entities_retrieved?.length > 0 && (
        <Section title="People & Places" icon={Users} defaultOpen={true} count={entities_retrieved.length}>
          {entities_retrieved.map((entity, i) => (
            <EntityCard key={entity.id || i} entity={entity} />
          ))}
        </Section>
      )}
      
      {/* Retrieved topics */}
      {topics_retrieved?.length > 0 && (
        <Section title="Topics" icon={Tag} defaultOpen={true} count={topics_retrieved.length}>
          {topics_retrieved.map((topic, i) => (
            <TopicCardV2 key={topic.id || i} topic={topic} />
          ))}
        </Section>
      )}
      
      {/* Retrieved episodes */}
      {episodes_retrieved?.length > 0 && (
        <Section title="Recent moments" icon={MessageSquare} defaultOpen={true} count={episodes_retrieved.length}>
          {episodes_retrieved.map((episode, i) => (
            <EpisodeCard key={episode.id || i} episode={episode} />
          ))}
        </Section>
      )}
      
      {/* Empty state */}
      {!isLoading && !entities_retrieved?.length && !topics_retrieved?.length && !episodes_retrieved?.length && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Brain className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Building Memory</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            As you share more, HridAI will<br />remember and connect the dots
          </p>
        </div>
      )}
    </div>
  );
}
