import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  User, 
  Users,
  Building2,
  MapPin,
  Stethoscope,
  MessageSquare, 
  Tag, 
  Clock, 
  Sparkles,
  Brain,
  Network,
  Zap,
  Heart,
  HelpCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

/**
 * Entity type configuration - colors and icons
 */
const ENTITY_TYPE_CONFIG = {
  person: { 
    color: 'blue', 
    icon: User, 
    bgClass: 'bg-blue-50 border-blue-200', 
    textClass: 'text-blue-700',
    iconClass: 'text-blue-500',
  },
  organization: { 
    color: 'purple', 
    icon: Building2, 
    bgClass: 'bg-purple-50 border-purple-200', 
    textClass: 'text-purple-700',
    iconClass: 'text-purple-500',
  },
  place: { 
    color: 'emerald', 
    icon: MapPin, 
    bgClass: 'bg-emerald-50 border-emerald-200', 
    textClass: 'text-emerald-700',
    iconClass: 'text-emerald-500',
  },
  location: { 
    color: 'emerald', 
    icon: MapPin, 
    bgClass: 'bg-emerald-50 border-emerald-200', 
    textClass: 'text-emerald-700',
    iconClass: 'text-emerald-500',
  },
  doctor: { 
    color: 'rose', 
    icon: Stethoscope, 
    bgClass: 'bg-rose-50 border-rose-200', 
    textClass: 'text-rose-700',
    iconClass: 'text-rose-500',
  },
  default: { 
    color: 'slate', 
    icon: Users, 
    bgClass: 'bg-slate-50 border-slate-200', 
    textClass: 'text-slate-700',
    iconClass: 'text-slate-500',
  },
};

/**
 * Topic status configuration
 */
const TOPIC_STATUS_CONFIG = {
  active: { 
    bgClass: 'bg-green-50 border-green-200', 
    textClass: 'text-green-700',
    icon: TrendingUp,
  },
  resolved: { 
    bgClass: 'bg-slate-50 border-slate-200', 
    textClass: 'text-slate-600',
    icon: CheckCircle,
  },
  pending: { 
    bgClass: 'bg-amber-50 border-amber-200', 
    textClass: 'text-amber-700',
    icon: AlertCircle,
  },
  default: { 
    bgClass: 'bg-slate-50 border-slate-200', 
    textClass: 'text-slate-600',
    icon: Tag,
  },
};

/**
 * Query type configuration
 */
const QUERY_TYPE_CONFIG = {
  ASKING: { color: 'indigo', label: 'Question' },
  SHARING: { color: 'cyan', label: 'Sharing' },
  REQUESTING: { color: 'amber', label: 'Request' },
  REFLECTING: { color: 'violet', label: 'Reflecting' },
  PLANNING: { color: 'emerald', label: 'Planning' },
  default: { color: 'slate', label: 'Query' },
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
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50/50 transition-colors group"
      >
        <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700 flex-1 text-left">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
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
      base: 'bg-blue-50 text-blue-700 border-blue-200',
      hover: 'hover:bg-blue-100 hover:border-blue-300',
    },
    topic: {
      base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hover: 'hover:bg-emerald-100 hover:border-emerald-300',
    },
    emotion: {
      base: 'bg-rose-50 text-rose-700 border-rose-200',
      hover: 'hover:bg-rose-100 hover:border-rose-300',
    },
    queryType: {
      base: 'bg-violet-50 text-violet-700 border-violet-200',
      hover: 'hover:bg-violet-100 hover:border-violet-300',
    },
    strategy: {
      base: 'bg-slate-50 text-slate-600 border-slate-200',
      hover: 'hover:bg-slate-100 hover:border-slate-300',
    },
    followup: {
      base: 'bg-amber-50 text-amber-700 border-amber-200',
      hover: 'hover:bg-amber-100 hover:border-amber-300',
    },
    timeRef: {
      base: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      hover: 'hover:bg-cyan-100 hover:border-cyan-300',
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
        <div className={`p-1.5 rounded-md bg-white/60 ${config.iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.textClass} truncate`}>
              {entity.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded bg-white/60 ${config.textClass} font-medium`}>
              {entity.entity_type}
            </span>
          </div>
          {entity.relationship_to_self && (
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" />
              {entity.relationship_to_self}
            </div>
          )}
        </div>
      </div>
      {entity.attributes && Object.keys(entity.attributes).length > 0 && (
        <div className="mt-2 pt-2 border-t border-black/5">
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(entity.attributes).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-xs bg-white/60 text-slate-600 px-2 py-0.5 rounded">
                {k}: {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            ))}
            {Object.keys(entity.attributes).length > 3 && (
              <span className="text-xs text-slate-400 px-2 py-0.5">
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
 * Topic card in context panel
 */
function TopicCard({ topic }) {
  const config = getTopicConfig(topic.status);
  const StatusIcon = config.icon;
  
  return (
    <div className={`rounded-lg p-3 mb-2 last:mb-0 border ${config.bgClass} transition-all duration-150 hover:shadow-sm`}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-white/60 text-slate-500">
          <Tag className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.textClass} truncate`}>
              {topic.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded bg-white/60 ${config.textClass} font-medium flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {topic.status || 'active'}
            </span>
          </div>
        </div>
      </div>
      {topic.context && (
        <p className="mt-2 text-xs text-slate-600 line-clamp-2 pl-9">
          {topic.context}
        </p>
      )}
      {topic.last_mentioned && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1 pl-9">
          <Clock className="w-3 h-3" />
          Last mentioned: {new Date(topic.last_mentioned).toLocaleDateString()}
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
    <div className="rounded-lg p-3 mb-2 last:mb-0 border border-slate-200 bg-slate-50/50 transition-all duration-150 hover:shadow-sm hover:bg-slate-50">
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-md bg-white text-slate-400 mt-0.5">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 line-clamp-2">
            {episode.summary}
          </p>
          {episode.created_at && (
            <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
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
 * Stats bar component
 */
function StatsBar({ timing_ms, strategiesCount, entitiesCount, topicsCount, episodesCount }) {
  const totalItems = (entitiesCount || 0) + (topicsCount || 0) + (episodesCount || 0);
  
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
      <div className="flex items-center gap-3">
        {timing_ms !== undefined && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">{timing_ms.toFixed(0)}ms</span>
          </div>
        )}
        {strategiesCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Lightbulb className="w-3.5 h-3.5 text-violet-500" />
            <span>{strategiesCount} strategies</span>
          </div>
        )}
      </div>
      {totalItems > 0 && (
        <div className="text-xs text-slate-400">
          {totalItems} item{totalItems !== 1 ? 's' : ''} retrieved
        </div>
      )}
    </div>
  );
}

/**
 * Context debug panel showing retrieval information
 */
export default function ContextPanel({ retrievalTrace, isLoading }) {
  if (!retrievalTrace && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
            <Brain className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Context Panel</p>
          <p className="text-xs mt-1 text-slate-400">
            As you chat, relevant context<br />will appear here
          </p>
        </div>
      </div>
    );
  }
  
  const { signals, strategies_used, entities_retrieved, topics_retrieved, episodes_retrieved, timing_ms } = 
    retrievalTrace || {};
  
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 z-10 shadow-sm lg:pt-3 pt-14">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-800">Context Retrieved</span>
            <p className="text-xs text-slate-400">What HrdAI knows about this</p>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      {!isLoading && retrievalTrace && (
        <StatsBar 
          timing_ms={timing_ms}
          strategiesCount={strategies_used?.length || 0}
          entitiesCount={entities_retrieved?.length || 0}
          topicsCount={topics_retrieved?.length || 0}
          episodesCount={episodes_retrieved?.length || 0}
        />
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-500 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-slate-600">Retrieving context...</p>
          <p className="text-xs text-slate-400 mt-1">Analyzing your message</p>
        </div>
      )}
      
      {/* Signals detected */}
      {signals && (
        <Section title="Signals Detected" icon={Sparkles} defaultOpen={true}>
          <div className="space-y-3">
            {/* Entities */}
            {signals.entities?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Entities Mentioned
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {signals.entities.map((e, i) => (
                    <SignalBadge key={i} type="entity" icon={User}>
                      {typeof e === 'string' ? e : e.name || 'Unknown'}
                    </SignalBadge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Topics */}
            {signals.topics?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Topics Detected
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {signals.topics.map((t, i) => (
                    <SignalBadge key={i} type="topic" icon={Tag}>
                      {typeof t === 'string' ? t : t.name || 'Unknown'}
                    </SignalBadge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Emotions */}
            {signals.emotions?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Emotions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {signals.emotions.map((e, i) => (
                    <SignalBadge key={i} type="emotion" icon={Heart}>
                      {e}
                    </SignalBadge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Time References */}
            {signals.time_refs?.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time References
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {signals.time_refs.map((t, i) => (
                    <SignalBadge key={i} type="timeRef" icon={Clock}>
                      {t}
                    </SignalBadge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Query Type */}
            {signals.query_type && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" />
                  Query Type
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <SignalBadge type="queryType" icon={HelpCircle}>
                    {QUERY_TYPE_CONFIG[signals.query_type]?.label || signals.query_type}
                  </SignalBadge>
                  {signals.is_followup && (
                    <SignalBadge type="followup">
                      Follow-up
                    </SignalBadge>
                  )}
                </div>
              </div>
            )}
            
            {/* Empty signals state */}
            {!signals.entities?.length && !signals.topics?.length && !signals.emotions?.length && !signals.query_type && (
              <p className="text-xs text-slate-400 italic">No specific signals detected</p>
            )}
          </div>
        </Section>
      )}
      
      {/* Strategies used */}
      {strategies_used?.length > 0 && (
        <Section title="Retrieval Strategies" icon={Lightbulb} defaultOpen={false} count={strategies_used.length}>
          <div className="flex flex-wrap gap-1.5">
            {strategies_used.map((s, i) => (
              <SignalBadge key={i} type="strategy">
                {s.replace(/_/g, ' ').toLowerCase()}
              </SignalBadge>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            These strategies determined what context to retrieve
          </p>
        </Section>
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
            <TopicCard key={topic.id || i} topic={topic} />
          ))}
        </Section>
      )}
      
      {/* Retrieved episodes */}
      {episodes_retrieved?.length > 0 && (
        <Section title="Past Conversations" icon={MessageSquare} defaultOpen={true} count={episodes_retrieved.length}>
          {episodes_retrieved.map((episode, i) => (
            <EpisodeCard key={episode.id || i} episode={episode} />
          ))}
        </Section>
      )}
      
      {/* Empty state */}
      {!isLoading && !entities_retrieved?.length && !topics_retrieved?.length && !episodes_retrieved?.length && (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
            <Brain className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-500">Building Memory</p>
          <p className="text-xs text-slate-400 mt-1">
            As you share more, HrdAI will<br />remember and connect the dots
          </p>
        </div>
      )}
    </div>
  );
}
