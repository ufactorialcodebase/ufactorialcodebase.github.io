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
