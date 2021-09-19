import { initLifecycle } from './lifecycle'
import { initErrorListener } from './error'
import { initHistoryListener } from './history'

export function init(monitor) {
  initLifecycle(monitor)
  initErrorListener(monitor)
  initHistoryListener(monitor)
}
