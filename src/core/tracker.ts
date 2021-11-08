import { getCommonInfo } from './common'
import { http, warn } from '../utils'
import { InitOptions, UploadType } from '../../types'

interface ConfigInit {
  immediate: boolean
}

const defOptions = {
  limit: 30,
  errorLimit: 15
}

export class Tracker {
  private queue: any[]
  private options: InitOptions
  private errorCount = 0
  constructor(options: InitOptions) {
    this.options = Object.assign({}, defOptions, options)
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
    const { url, errorLimit } = this.options
    if (this.errorCount >= errorLimit) {
      warn('reached errorLimit:', errorLimit)
      return
    }

    http(
      url,
      data,
      function success() {
        // reset
        this.errorCount = 0
      },
      function error() {
        this.errorCount++
        this.queue = data.concat(this.queue)
      }
    )
  }
  getNotSentData(): any[] {
    return this.queue
  }
}
