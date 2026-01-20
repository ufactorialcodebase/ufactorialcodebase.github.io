import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  Database,
  Search,
  CheckSquare,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Tag,
  Heart,
} from 'lucide-react';

/**
 * Tool type configurations with colors and icons
 */
const TOOL_CONFIGS = {
  store: {
    icon: Database,
    gradient: 'from-emerald-500 to-teal-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700',
    iconBgClass: 'bg-emerald-100',
    iconTextClass: 'text-emerald-600',
    label: 'Storing',
    description: 'Saving to memory',
  },
  search: {
    icon: Search,
    gradient: 'from-blue-500 to-indigo-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    iconBgClass: 'bg-blue-100',
    iconTextClass: 'text-blue-600',
    label: 'Searching',
    description: 'Looking up context',
  },
  todo: {
    icon: CheckSquare,
    gradient: 'from-amber-500 to-orange-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-700',
    iconBgClass: 'bg-amber-100',
    iconTextClass: 'text-amber-600',
    label: 'Task',
    description: 'Managing todos',
  },
  self: {
    icon: Heart,
    gradient: 'from-violet-500 to-purple-600',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
    textClass: 'text-violet-700',
    iconBgClass: 'bg-violet-100',
    iconTextClass: 'text-violet-600',
    label: 'Profile',
    description: 'Personal info',
  },
  default: {
    icon: Zap,
    gradient: 'from-slate-500 to-slate-700',
    bgClass: 'bg-slate-50',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-700',
    iconBgClass: 'bg-slate-100',
    iconTextClass: 'text-slate-600',
    label: 'Tool',
    description: 'Processing',
  },
};

/**
 * Get tool configuration based on tool name
 */
function getToolConfig(toolName) {
  const name = toolName.toLowerCase();
  
  if (name.includes('store') || name.includes('create') || name.includes('add') || name.includes('update')) {
    return TOOL_CONFIGS.store;
  }
  if (name.includes('search') || name.includes('get') || name.includes('list') || name.includes('find')) {
    return TOOL_CONFIGS.search;
  }
  if (name.includes('todo')) {
    return TOOL_CONFIGS.todo;
  }
  if (name.includes('self')) {
    return TOOL_CONFIGS.self;
  }
  
  return TOOL_CONFIGS.default;
}

/**
 * Format tool name for display
 */
function formatToolName(name) {
  return name
    .replace('memory_', '')
    .replace('self_', '')
    .replace('todo_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format input value for display
 */
function formatValue(value, depth = 0) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (depth > 1) return `[${value.length} items]`;
    return `[${value.map(v => formatValue(v, depth + 1)).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    if (depth > 0) return `{${keys.length} fields}`;
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Extract summary value from tool input
 */
function getSummaryInfo(toolCall) {
  const input = toolCall.input || {};
  
  // Priority fields to show in collapsed view
  const priorityFields = ['name', 'canonical_name', 'entity_type', 'relationship_to_self', 'aspect', 'title', 'query'];
  
  for (const field of priorityFields) {
    if (input[field]) {
      return { field, value: input[field] };
    }
  }
  
  // Fallback to first string field
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string' && value.length < 50) {
      return { field: key, value };
    }
  }
  
  return null;
}

/**
 * Tool call visualization card
 */
export default function ToolCallCard({ toolCall, isStreaming = false }) {
  const [expanded, setExpanded] = useState(false);
  const config = getToolConfig(toolCall.name);
  const Icon = config.icon;
  const summaryInfo = getSummaryInfo(toolCall);
  
  return (
    <div className={`
      rounded-xl border overflow-hidden transition-all duration-200
      ${config.borderClass} ${config.bgClass}
      hover:shadow-md
    `}>
      {/* Header - always visible */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/50"
      >
        {/* Expand/collapse icon */}
        <div className="text-slate-400">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        
        {/* Tool icon with gradient background */}
        <div className={`p-2 rounded-lg ${config.iconBgClass}`}>
          <Icon className={`w-4 h-4 ${config.iconTextClass}`} />
        </div>
        
        {/* Tool info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.textClass}`}>
              {config.label}
            </span>
            <span className="text-xs text-slate-500">
              {formatToolName(toolCall.name)}
            </span>
          </div>
          {summaryInfo && (
            <div className="text-sm text-slate-600 truncate mt-0.5">
              <span className="text-slate-400">{summaryInfo.field}:</span>{' '}
              <span className="font-medium">{summaryInfo.value}</span>
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Running</span>
            </div>
          ) : toolCall.success !== false ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium">Done</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-500">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Failed</span>
            </div>
          )}
        </div>
        
        {/* Duration */}
        {toolCall.duration_ms && (
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-white/50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            {toolCall.duration_ms.toFixed(0)}ms
          </div>
        )}
      </button>
      
      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/50">
          {/* Input parameters */}
          {toolCall.input && Object.keys(toolCall.input).length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Input Parameters</div>
              <div className="bg-white/70 rounded-lg p-3 border border-white">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(toolCall.input).map(([key, value]) => (
                      <tr key={key} className="border-b border-slate-100 last:border-0">
                        <td className="py-1.5 pr-3 text-slate-500 font-medium align-top whitespace-nowrap">
                          {key}
                        </td>
                        <td className="py-1.5 text-slate-700 font-mono text-xs break-all">
                          {typeof value === 'object' ? (
                            <pre className="whitespace-pre-wrap bg-slate-50 p-2 rounded mt-1">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            formatValue(value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {toolCall.error && (
            <div>
              <div className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Error</div>
              <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {toolCall.error}
              </div>
            </div>
          )}
          
          {/* Success result hint */}
          {!toolCall.error && toolCall.success !== false && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Operation completed successfully
            </div>
          )}
        </div>
      )}
    </div>
  );
}
