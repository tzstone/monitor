export function fill(source: { [key: string]: any }, name: string, replacementFactory: (...args: any[]) => any) {
  if (!(name in source)) return

  const original = source[name]
  const wrapped = replacementFactory(original)

  // Make sure it's a function first, as we need to attach an empty prototype for `defineProperties` to work
  // otherwise it'll throw "TypeError: Object.defineProperties called on non-object"
  if (typeof wrapped === 'function') {
    try {
      wrapped.prototype = wrapped.prototype || {}
      Object.defineProperties(wrapped, {
        __flow_original__: {
          enumerable: false,
          value: original
        }
      })
    } catch (err) {
      // This can throw if multiple fill happens on a global object like XMLHttpRequest
    }
  }

  source[name] = wrapped
}
