import { error } from './utils'
import { initCollect } from './core'
import { Tracker } from './core/tracker'
import { InitOptions } from './types'

const defOptions = {
  limit: 30
}

export class Monitor {
  options: InitOptions
  $tracker: Tracker
  constructor(options: InitOptions) {
    if (!(this instanceof Monitor)) {
      error('Monitor is a constructor and should be called with the `new` keyword')
      return
    }

    if (window['__monitor_installed__']) {
      error('Monitor already installed!')
      return
    }

    Object.defineProperties(window, {
      __monitor_installed__: {
        enumerable: false,
        value: true
      }
    })

    this.options = Object.assign({}, defOptions, options || {}) as InitOptions
    this.$tracker = new Tracker(this.options)
    initCollect(this)
  }
  track(data, config?) {
    this.$tracker.track(data, config)
  }
}
