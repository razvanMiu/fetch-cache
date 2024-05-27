// Cache constants
export const CACHE_TTL = 60 * 60 * 24 * 30 * 1000 // 30 days
export const TIMEOUT = 10 * 1000 // 10 seconds

// Error messages
export const ERROR_MESSAGES: Record<string, { code: string; message: string }> =
  {
    eunknown: {
      code: 'EUNKNOWN',
      message: 'Unknown error',
    },
    econnrefused: {
      code: 'ECONNREFUSED',
      message: 'Connection refused',
    },
    econnreset: {
      code: 'ECONNRESET',
      message: 'Connection reset',
    },
    etimedout: {
      code: 'ETIMEDOUT',
      message: 'Connection timed out',
    },
    esockopened: {
      code: 'ESOCKOPENED',
      message: 'Socket already opened',
    },
    econnclosed: {
      code: 'ECONNCLOSED',
      message: 'The client is closed',
    },
    econndisconnecting: {
      code: 'ECONNDISCONNECTING',
      message: 'Disconnects client',
    },
    esockclosed: {
      code: 'ESOCKCLOSED',
      message: 'Socket closed unexpectedly',
    },
    'socket already opened': {
      code: 'ESOCKOPENED',
      message: 'Socket already opened',
    },
    'socket closed unexpectedly': {
      code: 'ESOCKCLOSED',
      message: 'Socket closed unexpectedly',
    },
    'the client is closed': {
      code: 'ECONNCLOSED',
      message: 'The client is closed',
    },
    'disconnects client': {
      code: 'ECONNDISCONNECTING',
      message: 'Disconnects client',
    },
  }
