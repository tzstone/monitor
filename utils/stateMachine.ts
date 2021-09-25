interface TransitionInfo {
  from: string
  to: string
  handler?: (newState: string, oldState: string) => boolean | void // 返回false表示不允许状态流转
}

interface OptionsInit {
  init: string
  transitions: TransitionInfo[]
  onEnterState?: (state: string) => void
  onLeaveState?: (state: string) => void
}

export class StateMachine {
  private state: string
  private transitions: TransitionInfo[] // 定义允许的状态流转过程
  private onEnterState: (state: string) => void
  private onLeaveState: (state: string) => void
  constructor(options: OptionsInit) {
    const { init, transitions, onEnterState, onLeaveState } = options
    this.state = init
    this.transitions = transitions
    this.onEnterState = onEnterState
    this.onLeaveState = onLeaveState
    if (this.onEnterState) this.onEnterState(this.state)
  }
  setState(newState) {
    const transition = this.transitions.find(e => e.from === this.state && e.to === newState)
    if (transition) {
      if (typeof transition.handler === 'function' && transition.handler(newState, this.state) === false) return

      if (this.onLeaveState) this.onLeaveState(this.state)

      this.state = newState

      if (this.onEnterState) this.onEnterState(newState)
    }
  }
  getState() {
    return this.state
  }
}
