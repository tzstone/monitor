import { initLifecycle } from './lifecycle'
import { startCollectError } from './error'
import { startCollectHistory } from './history'

export function initCollect(monitor) {
  initLifecycle(monitor)
  startCollectError(monitor)
  startCollectHistory(monitor)
}
