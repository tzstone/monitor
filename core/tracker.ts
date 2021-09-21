import { getCommonInfo } from './common'
import { http } from '../utils'
import { InitOptions, UploadType } from '../types'
import { CACHE_KEY } from '../shared/constants'

interface ConfigInit {
  immediate: boolean
}

const defOptions = {
  limit: 30
}

export class Tracker {
  private queue: any[]
  private options: InitOptions
  constructor(options: InitOptions) {
    this.options = Object.assign({}, defOptions, options)
    this.checkCacheData()
  }
  track(data, uploadType: UploadType, config?: ConfigInit) {
    const { limit, debug } = this.options
    const commonInfo = getCommonInfo(this.options, uploadType)
    const info = Object.assign({}, commonInfo, data)

    if (debug) {
      console.log('[monitor track]:', info)
    }

    if (config && config.immediate) {
      this.send([info])
    } else {
      this.queue.push(info)
      if (this.queue.length >= limit) {
        const buffer = this.queue.splice(0, limit)
        this.send(buffer)
      }
    }
  }
  private send(data: any[]) {
    const { url } = this.options
    http(
      url,
      data,
      function success() {
        // do-nothing
      },
      function error() {
        this.queue = data.concat(this.queue)
      }
    )
  }
  private checkCacheData() {
    let cacheData = localStorage.getItem(CACHE_KEY)
    cacheData = (cacheData && JSON.parse(cacheData)) || []
    if (cacheData && cacheData.length > 0) {
      // @ts-ignore
      this.send(cacheData)
    }
  }
  getNotSentData(): any[] {
    return this.queue
  }
}
