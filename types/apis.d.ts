import { InitOptions } from './common'
import { Tracker } from '../src/core/tracker'

export interface Monitor {
  readonly options: InitOptions
  readonly $tracker: Tracker
  track(data: any, config?): void
}
