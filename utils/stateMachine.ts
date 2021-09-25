interface EventInfo {
  from: string
  to: string
  handler?: (oldState: string, newState: string) => void
}

interface OptionsInit {
  initial: string
  events?: EventInfo[]
  allowStateCycle?: boolean // 允许状态循环转变(即转变至当前状态)
  onEnterState?: (state: string) => void
  onLeaveState?: (state: string) => void
}

export class StateMachine {
  private state: string
  private events: EventInfo[]
  private onEnterState: (state: string) => void
  private onLeaveState: (state: string) => void
  private allowStateCycle = false
  constructor(options: OptionsInit) {
    const { initial, events, onEnterState, onLeaveState, allowStateCycle } = options
    this.state = initial
    this.events = events
    this.onEnterState = onEnterState
    this.onLeaveState = onLeaveState
    if (allowStateCycle != null) {
      this.allowStateCycle = allowStateCycle
    }
    if (this.onEnterState) this.onEnterState(this.state)
  }
  setState(newState) {
    if (!this.allowStateCycle && this.state === newState) return

    const event = this.events.find(e => e.from === this.state && e.to === newState)
    if (event && typeof event.handler === 'function') {
      event.handler(this.state, newState)
    }

    if (this.onLeaveState) this.onLeaveState(this.state)

    this.state = newState

    if (this.onEnterState) this.onEnterState(newState)
  }
}
