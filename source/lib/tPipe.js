/*
It aims to support both http and amqp requests while doing some cross cutting concern
Tiny bit inspired in amazon api gateway resource processing structure.
Caveats: now is just for http using connect middleware format
input structure is:
	parameters
	body
output
	parameters
	body
*/
import "babel-polyfill"
import { Logger } from './utils/log.js'
import match from './utils/match.js'
import Promise from './promise.js'
import {
  requestInputMapping,
  sendResponseFinallyMapping,
  statusErrorMapping
} from './tPipeExpress.js'

const logger = new Logger('nicosommi.tPipe')

const errorMatch = Symbol('errorMatch')

export default class TPipe {
  constructor (handler, options = {}) {
    this.handler = handler
    this.options = options

    if (!this.options.metaKey) {
      logger.log('default meta key')
      this.options.metaKey = 'parameters'
    }

    if (!this.options.payloadKey) {
      logger.log('default body key')
      this.options.payloadKey = 'body'
    }

    if (!this.options.inputMappings) {
      logger.log('default input mapping')
      this.options.inputMappings = [requestInputMapping]
    }

    if (!this.options.outputMappings) {
      logger.log('default output mapping')
      this.options.outputMappings = []
    }

    if (!this.options.finallyMappings) {
      logger.log('default finally mapping')
      this.options.finallyMappings = [sendResponseFinallyMapping]
    }

    if (!this.options.errorMappings && !this.options.errorMatch) {
      logger.log('default error mapping')
      this.options.errorMappings = [statusErrorMapping]
    } else if (!this.options.errorMappings && this.options.errorMatch) {
      this.options.errorMappings = [this[errorMatch], statusErrorMapping]
    }
  }

  [ errorMatch ] (error) {
    logger.log('errorMatch begin')
    const status = match(this.options.errorMatch || [], error.body.message, 500)
    logger.log('sending error response', { status })
    error.parameters.status = status
    return Promise.resolve(error)
  }

  pipe (array, functionArgs, output, description = 'default') {
    return Promise.reduce(array,
      (accumulator, currentElement, index) => {
        if (!currentElement) {
          logger.log('Invalid mapping detected')
          throw new Error(`Invalid ${description} mapping received at position ${index}`)
        }
        return currentElement.call(this, accumulator, ...functionArgs)
      },
      output)
  }

  getHandler () {
    // utility for express
    return this.open.bind(this)
  }

  getThunk () {
    // utility for redux
    return (...args) => {
      return (...more) => {
        return this.open.apply(this, args.concat(more))
      }
    }
  }

  async open (...args) {
    logger.log('processing message')
    let input = {
      [this.options.metaKey]: {},
      [this.options.payloadKey]: {}
    }
    let output = { 
      [this.options.metaKey]: {}, 
      [this.options.payloadKey]: {} 
    }
    logger.log('mapping message input')
    const inputPipeArgs = [].concat(args)
    try {
      input = await this.pipe(this.options.inputMappings, inputPipeArgs, input, 'input')
      output = await this.handler(input)
      logger.log('mapping message process output', {output})
      const outputPipeArgs = [input].concat(args)
      await this.pipe(this.options.outputMappings, outputPipeArgs, output, 'output')
    } catch (error) {
      output = { [this.options.metaKey]: {}, [this.options.payloadKey]: error }
      logger.log('error mapping')
      const errorPipeArgs = [input].concat(args)
      await this.pipe(this.options.errorMappings, errorPipeArgs, output, 'error')
    }
    logger.log('finally mapping')
    const finallyPipeArgs = [input].concat(args)
    return this.pipe(this.options.finallyMappings, finallyPipeArgs, output, 'finally')
  }
}
