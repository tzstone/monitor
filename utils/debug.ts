// eslint-disable-next-line
const noop = () => {}

export const warn = (() => {
  return function (...args) {
    typeof console.warn === 'function' ? console.warn(`[monitor warn]`, ...args) : noop
  }
})()

export const error = (() => {
  return function (...args) {
    typeof console.error === 'function' ? console.error(`[monitor error]`, ...args) : noop
  }
})()
