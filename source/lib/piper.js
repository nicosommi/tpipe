import TPipe from './tPipe.js'

export class Piper {
  constructor (pipe) {
    this.pipe = pipe
  }

  concatTo (key, params) {
    this.pipe.options[key] = this.pipe.options[key].concat(params)
    return this
  }

  incorporate ({ inputMappings, outputMappings, finallyMappings, errorMappings, extraProperties = {} }) {
    this.input.apply(this, inputMappings)
    this.output.apply(this, outputMappings)
    this.finally.apply(this, finallyMappings)
    this.error.apply(this, errorMappings)
    Object.keys(extraProperties).forEach(
      key => {
        Object.defineProperty(
          this.pipe,
          key,
          {
            value: extraProperties[key]
          }
        )
      }
    )
    return this
  }

  input (...args) {
    return this.concatTo('inputMappings', args)
  }

  output (...args) {
    return this.concatTo('outputMappings', args)
  }

  error (...args) {
    return this.concatTo('errorMappings', args)
  }

  finally (...args) {
    return this.concatTo('finallyMappings', args)
  }

  empty (key) {
    this.pipe.options[key] = []
  }

  reset () {
    this.empty('inputMappings')
    this.empty('outputMappings')
    this.empty('errorMappings')
    this.empty('finallyMappings')
    return this
  }
}

export default function piper (handler, options = {}) {
  const pipe = new TPipe(handler)
  const result = new Piper(pipe)
  result.reset()
  Object.assign(result.pipe.options, options)
  return result
}
