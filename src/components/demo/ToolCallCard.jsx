import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

/**
 * ISS-090: Tool display configuration
 *
 * Maps tool names to human-readable success messages and loading text.
 * Only tools in this map are shown — read-only tools and unknown tools are hidden.
 * The `message` function receives `toolCall.input` and returns the display text.
 */
const TOOL_DISPLAY = {
  memory_store_entity: {
    message: (input) => `New entity created — ${input.canonical_name || input.name || 'entity'}`,
    loading: 'Saving entity...',
  },
  memory_update_entity: {
    message: (input) => `Entity updated — ${input.name || input.canonical_name || 'entity'}`,
    loading: 'Updating entity...',
  },
  memory_add_alias: {
    message: (input) => `Alias added — ${input.alias || 'alias'} → ${input.entity_name || input.name || 'entity'}`,
    loading: 'Adding alias...',
  },
  memory_merge_entities: {
    message: (input) => `Entities merged — ${input.keep_name || input.name || 'entity'}`,
    loading: 'Merging entities...',
  },
  memory_create_relationship: {
    message: (input) => `Relationship added — ${input.from_entity || 'entity'} → ${input.to_entity || 'entity'}`,
    loading: 'Adding relationship...',
  },
  memory_store_self: {
    message: (input) => `Profile updated — ${input.aspect || 'info'}`,
    loading: 'Updating profile...',
  },
  todo_create: {
    message: (input) => `New todo added — ${input.title || 'task'}`,
    loading: 'Creating todo...',
  },
  todo_update: {
    message: (input) => `Todo updated — ${input.title || 'task'}`,
    loading: 'Updating todo...',
  },
  todo_complete: {
    message: (input) => `Todo completed — ${input.title || 'task'}`,
    loading: 'Completing todo...',
  },
  create_artifact: {
    message: () => 'Artifact created — View in Artifacts tab',
    loading: 'Creating artifact...',
  },
  update_artifact: {
    message: () => 'Artifact updated — View in Artifacts tab',
    loading: 'Updating artifact...',
  },
  list_create: {
    message: (input) => `New list created — ${input.name || 'list'}`,
    loading: 'Creating list...',
  },
  list_add_item: {
    message: (input) => `Item added to ${input.list_name || input.name || 'list'}`,
    loading: 'Adding to list...',
  },
  list_remove_item: {
    message: (input) => `Item removed from ${input.list_name || input.name || 'list'}`,
    loading: 'Removing from list...',
  },
};

/**
 * Check if a tool call should be displayed.
 * Only successful write tools in the whitelist are shown.
 * Returns false for: read-only tools, failed tools, unknown tools.
 */
export function shouldShowToolCall(toolCall) {
  // Not in our display whitelist — hide (covers all read-only tools)
  if (!TOOL_DISPLAY[toolCall.name]) return false;
  // Failed — hide
  if (toolCall.success === false) return false;
  // Pending (still loading) or succeeded — show
  return true;
}

/**
 * Minimal tool call pill — one line with green checkmark or loading spinner.
 * Replaces the old collapsible ToolCallCard (ISS-090).
 */
export default function ToolCallCard({ toolCall }) {
  const config = TOOL_DISPLAY[toolCall.name];
  if (!config) return null;

  const isPending = toolCall.success === null;
  const input = toolCall.input || {};

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40">
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-spin flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
      )}
      <span className="text-sm text-emerald-700 dark:text-emerald-300 truncate">
        {isPending ? config.loading : config.message(input)}
      </span>
    </div>
  );
}
