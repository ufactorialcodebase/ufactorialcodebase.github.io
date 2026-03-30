// src/lib/api/index.js
export {
  getAccessCode, setAccessCode, clearAccessCode,
  getSessionId, setSessionId, clearSessionId,
  validateAccessCode, useAccessCode,
} from './auth.js'

export {
  getGreeting, sendMessage, sendMessageStream,
  getContext, endSession, endSessionBeacon, checkHealth,
} from './chat.js'

export {
  startPersonaSession, endPersonaSession, endPersonaSessionBeacon,
  listPersonas, getPersona,
} from './personas.js'

export { getStats } from './vault-stats.js'

export { getSelf, updateSelf } from './vault-self.js'
export { getEntities, getEntity, updateEntity, deleteEntity } from './vault-entities.js'
