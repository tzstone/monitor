import { getCommonInfo } from './common'
import { http } from '../utils'
import { InitOptions, UploadType } from '../types'

interface ConfigInit {
  immediate: boolean
}

export class Tracker {
  private queue: any[]
  private options: InitOptions
  constructor(options: InitOptions) {
    // TODO: def
    this.options = options
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
  getNotSentData(): any[] {
    return this.queue
  }
}
