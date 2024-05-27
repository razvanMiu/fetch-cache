/* eslint-disable no-var */
import { Settings } from 'src/config'

export {}

declare global {
  var fetchCacheConfig: {
    settings: Settings
  }
}
