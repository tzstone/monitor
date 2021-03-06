import { JsErrorInfo } from '../../types'
import { isError, isObjectLike } from './lang'
interface JSErrorInit {
  msg: string
  url?: string
  line?: number
  col?: number
  error?: Error
  type?: string
}

export function formatJSError({ msg, url, line, col, error, type }: JSErrorInit): JsErrorInfo {
  if (msg == null) msg = ''
  msg += ''

  let stack = error ? error.stack : ''
  if (stack as string) {
    stack = stack.substring(0, 1e3)
  }

  if (!type) {
    type = 'Error'
  }

  const ERROR_TYPES_RE =
    /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i
  const groups = msg.match(ERROR_TYPES_RE)
  if (groups) {
    if (groups[1]) {
      type = groups[1]
    }
    msg = groups[2]
  }

  return {
    errorMsg: msg,
    errorUrl: url,
    errorLine: line,
    errorCol: col,
    errorStack: stack,
    errorType: type
  }
}

export function errorReason2String(reason): string {
  if (reason == null) return ''
  if (isError(reason)) return reason.message
  if (isObjectLike(reason)) return JSON.stringify(reason)
  return reason + ''
}
