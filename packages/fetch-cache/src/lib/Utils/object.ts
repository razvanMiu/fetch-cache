export function sortInput(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortInput)
  }
  const sortedObj: Record<string, any> = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sortedObj[key] = sortInput(obj[key])
  }
  return sortedObj
}

export function arrayBufferToJSON(buffer: ArrayBuffer): any {
  return JSON.parse(new TextDecoder('utf-8').decode(buffer))
}
