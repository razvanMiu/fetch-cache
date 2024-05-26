import { sha256 } from 'hash-wasm'

import { sortInput } from './object'

export async function getHashKey(input: any): Promise<string> {
  const sortedInput = sortInput(input)
  try {
    return sha256(JSON.stringify(sortedInput))
  } catch {
    if (Buffer.isBuffer(input)) {
      return sha256(input)
    }
    return Promise.reject('Failed to hash input')
  }
}
