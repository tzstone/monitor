import { initLifecycle, initEvent } from './lifecycle'
import { initErrorCollect } from './error'
import { initHistoryCollect } from './history'
import { initPerformanceCollect } from './performance'

export function init(monitor) {
  initLifecycle(monitor)
  initErrorCollect(monitor)
  initHistoryCollect(monitor)
  initPerformanceCollect(monitor)
  // 最后监听事件, 确保monitor的beforeunload上报最后执行
  initEvent(monitor)
}
