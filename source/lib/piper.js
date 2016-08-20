import TPipe from './tPipe.js'

export class Piper {
  constructor(pipe) {
    this.pipe = pipe
  }

  concatTo(key, params) {
    this.pipe.options[key] = this.pipe.options[key].concat(params)
    return this
  }

  input(...args) {
    return this.concatTo('inputMappings', args)
  }

  output(...args) {
    return this.concatTo('outputMappings', args)
  }

  error(...args) {
    return this.concatTo('errorMappings', args)
  }

  finally(...args) {
    return this.concatTo('finallyMappings', args)
  }

  empty(key) {
    this.pipe.options[key] = []
  }

  reset() {
    this.empty('inputMappings')
    this.empty('outputMappings')
    this.empty('errorMappings')
    this.empty('finallyMappings')
  }
}



export default function piper(handler, options = {}) {
  const pipe = new TPipe(handler, options);
  return new Piper(pipe);
}
