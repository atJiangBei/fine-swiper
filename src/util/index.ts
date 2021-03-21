export const time: Function =
  Date.now ||
  function() {
    return +new Date()
  }

export const noop: Function = function() {}
