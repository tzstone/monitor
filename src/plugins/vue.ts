import { fill, formatJSError, isDevEnv } from '../utils'
import { Monitor, UploadType, ViewModel, VueErrorInfo } from '../../types'

const classifyRE = /(?:^|[-_])(\w)/g
const classify = (str: string): string => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '')

const ROOT_COMPONENT_NAME = '<Root>'
const ANONYMOUS_COMPONENT_NAME = '<Anonymous>'

const repeat = (str: string, n: number): string => {
  let res = ''
  while (n) {
    if (n % 2 === 1) {
      res += str
    }
    if (n > 1) {
      str += str // eslint-disable-line no-param-reassign
    }
    n >>= 1 // eslint-disable-line no-bitwise, no-param-reassign
  }
  return res
}

export const formatComponentName = (vm?: ViewModel, includeFile?: boolean): string => {
  if (!vm) {
    return ANONYMOUS_COMPONENT_NAME
  }

  if (vm.$root === vm) {
    return ROOT_COMPONENT_NAME
  }

  const options = vm.$options

  let name = options.name || options._componentTag
  const file = options.__file
  if (!name && file) {
    const match = file.match(/([^/\\]+)\.vue$/)
    if (match) {
      name = match[1]
    }
  }

  return (
    (name ? `<${classify(name)}>` : ANONYMOUS_COMPONENT_NAME) + (file && includeFile !== false ? ` at ${file}` : ``)
  )
}

export const generateComponentTrace = (vm?: ViewModel): string => {
  if (vm?._isVue && vm?.$parent) {
    const tree = []
    let currentRecursiveSequence = 0
    while (vm) {
      if (tree.length > 0) {
        const last = tree[tree.length - 1] as any
        if (last.constructor === vm.constructor) {
          currentRecursiveSequence += 1
          vm = vm.$parent // eslint-disable-line no-param-reassign
          continue
        } else if (currentRecursiveSequence > 0) {
          tree[tree.length - 1] = [last, currentRecursiveSequence]
          currentRecursiveSequence = 0
        }
      }
      tree.push(vm)
      vm = vm.$parent // eslint-disable-line no-param-reassign
    }

    const formattedTree = tree
      .map(
        (vm, i) =>
          `${
            (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) +
            (Array.isArray(vm)
              ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
              : formatComponentName(vm))
          }`
      )
      .join('\n')

    return `\n\nfound in\n\n${formattedTree}`
  }

  return `\n\n(found in ${formatComponentName(vm)})`
}
export const plugin = {
  init(Vue) {
    this.Vue = Vue
  },
  install(monitor: Monitor) {
    const { Vue } = this
    // ???????????????????????????errorHandler, ??????????????????
    if (!Vue || isDevEnv()) return

    // eslint-disable-next-line
    fill(Vue.config, 'errorHandler', function (original) {
      return function (error: Error, vm: ViewModel, lifecycleHook: string) {
        const componentName = formatComponentName(vm, false)
        const trace = vm ? generateComponentTrace(vm) : ''
        const errorInfo = formatJSError({ msg: error && error.message, error })
        const errorMsg = `Error in ${lifecycleHook}: "${errorInfo.errorMsg}"`
        const data: VueErrorInfo = Object.assign(errorInfo, { componentName, trace, errorMsg })
        monitor.track(data, UploadType.JsError)

        if (typeof original === 'function') {
          original.call(this, error, vm, lifecycleHook)
        }
      }
    })
  }
}
