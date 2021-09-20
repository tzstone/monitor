import { initLifecycle } from './lifecycle'
import { initErrorCollect } from './error'
import { initHistoryCollect } from './history'
import { initPerformanceCollect } from './performance'

export function init(monitor) {
  initLifecycle(monitor)
  initErrorCollect(monitor)
  initHistoryCollect(monitor)
  initPerformanceCollect(monitor)
}
