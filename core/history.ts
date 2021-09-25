import { on, fill, StateMachine } from '../utils'
import { Monitor, HistoryInfo, UploadType } from '../types'

enum State {
  Active = 'active',
  Passive = 'passive',
  Terminated = 'terminated'
}
export function initHistoryCollect(monitor: Monitor) {
  let startTime, endTime, from, to
  let stayTimeMap: { [url: string]: number }

  function getStayTime(url: string): number {
    let stayTime = 0
    // passive状态无startTime
    if (startTime) {
      stayTime = endTime - startTime
    }
    const cacheStayTime = stayTimeMap[url] || 0
    return stayTime + cacheStayTime
  }

  const activeHandler = function () {
    startTime = +new Date()
    from = location.href
  }

  const terminatedHandler = function () {
    endTime = +new Date()
    // unload时to=null
    to = location.href === from ? null : location.href
    const stayTime = getStayTime(from)
    delete stayTimeMap[from]

    // TODO: check load完成
    if (stayTime > 0) {
      const initData: HistoryInfo = {
        from,
        to,
        stayTime
      }
      monitor.track(initData, UploadType.History)
    }
  }

  const passiveHandler = function () {
    const stayTime = +new Date() - startTime
    if (!stayTimeMap[from]) {
      stayTimeMap[from] = stayTime
    } else {
      stayTimeMap[from] += stayTime
    }
    startTime = null
  }

  const stateMachine = new StateMachine({
    init: State.Active,
    transitions: [
      { from: State.Active, to: State.Passive },
      { from: State.Active, to: State.Terminated },
      { from: State.Passive, to: State.Active },
      { from: State.Passive, to: State.Terminated },
      { from: State.Terminated, to: State.Active }
    ],
    onEnterState(state) {
      switch (state) {
        case State.Active:
          activeHandler()
          break
        case State.Passive:
          passiveHandler()
          break
        case State.Terminated:
          terminatedHandler()
          break
      }
    }
  })

  on(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      stateMachine.setState(State.Active)
    } else {
      stateMachine.setState(State.Passive)
    }
  })
  ;['blur', 'focus', 'load', 'pageshow', 'beforeunload', 'pagehide'].forEach(key => {
    on(window, key, () => {
      switch (key) {
        case 'load':
        case 'pageshow':
        case 'focus':
          stateMachine.setState(State.Active)
          break
        case 'blur':
          stateMachine.setState(State.Passive)
          break
        case 'beforeunload':
        case 'pagehide':
          stateMachine.setState(State.Terminated)
          break
      }
    })
  })

  function historyChangeHandler(e?) {
    // singleSpa会重写pushState, replaceState, 使其触发popstate事件
    if (e && e.singleSpa) return
    // 保存记录
    stateMachine.setState(State.Terminated)
    // 激活当前url
    stateMachine.setState(State.Active)
  }

  on(window, 'hashchange', historyChangeHandler)
  on(window, 'popstate', historyChangeHandler)
  ;['pushState', 'replaceState'].forEach(key => {
    fill(window.history, key, function (original) {
      return function (...args) {
        // 先触发路由变化
        original.apply(this, args)
        historyChangeHandler()
      }
    })
  })
}
