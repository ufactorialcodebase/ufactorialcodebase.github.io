// src/lib/api/vault-todos.js
import { apiFetch } from '../api-client.js'

export async function getTodos(params = {}) {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.include_completed) query.set('include_completed', 'true')
  const qs = query.toString()
  return apiFetch(`/vault/todos${qs ? '?' + qs : ''}`)
}

export async function createTodo(data) {
  return apiFetch('/vault/todos', { method: 'POST', body: data })
}

export async function updateTodo(id, data) {
  return apiFetch(`/vault/todos/${id}`, { method: 'PUT', body: data })
}

export async function completeTodo(id) {
  return apiFetch(`/vault/todos/${id}/complete`, { method: 'PUT' })
}

export async function deleteTodo(id) {
  return apiFetch(`/vault/todos/${id}`, { method: 'DELETE' })
}

// ── Today Focus List ──

export async function getTodayTodos() {
  return apiFetch('/vault/todos/today')
}

export async function setTodoToday(id, inToday) {
  return apiFetch(`/vault/todos/${id}/today`, {
    method: 'PUT',
    body: { in_today: inToday },
  })
}

export async function reorderToday(todoIds) {
  return apiFetch('/vault/todos/today/reorder', {
    method: 'PUT',
    body: { todo_ids: todoIds },
  })
}

// ── Todo Tags ──

export async function getTodoTags() {
  return apiFetch('/vault/todo-tags')
}

export async function createTodoTag(name, color) {
  return apiFetch('/vault/todo-tags', {
    method: 'POST',
    body: { name, color },
  })
}

export async function updateTodoTag(id, data) {
  return apiFetch(`/vault/todo-tags/${id}`, { method: 'PUT', body: data })
}

export async function deleteTodoTag(id) {
  return apiFetch(`/vault/todo-tags/${id}`, { method: 'DELETE' })
}

export async function setTodoTags(todoId, tags) {
  return apiFetch(`/vault/todos/${todoId}/tags`, {
    method: 'PUT',
    body: { tags },
  })
}
