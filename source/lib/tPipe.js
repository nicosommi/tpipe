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

import { Logger } from './log.js'
import match from './match.js'
import Promise from './promise.js'

const logger = new Logger('nicosommi.tPipe')

const errorMatch = Symbol('errorMatch')

export function expressResponseMapping (output, input, req, res, next) {
  logger.log('expressResponse begin', {input, output})
  res.send(output.parameters.status || 200, output.body)
  next()
  return Promise.resolve(output)
}

export function expressRequestMapping (input, req) {
  logger.log('expressRequest begin')
  input.parameters = req.params
  input.body = req.body
  return Promise.resolve(input)
}

export function expressErrorMapping (errorOutput) {
  logger.log('expressError begin')
  if (!errorOutput.parameters.status) {
    errorOutput.parameters.status = 500
  }
  return Promise.resolve(errorOutput)
}

export default class TPipe {
  constructor (handler, options) {
    this.handler = handler
    this.options = options || {}

    if (!this.options.inputMappings) {
      logger.log('default input mapping')
      this.options.inputMappings = [expressRequestMapping]
    }

    if (!this.options.outputMappings) {
      logger.log('default output mapping')
      this.options.outputMappings = []
    }

    if (!this.options.finallyMappings) {
      logger.log('default finally mapping')
      this.options.finallyMappings = [expressResponseMapping]
    }

    if (!this.options.errorMappings && !this.options.errorMatch) {
      logger.log('default error mapping')
      this.options.errorMappings = [expressErrorMapping]
    } else if (!this.options.errorMappings && this.options.errorMatch) {
      this.options.errorMappings = [this[errorMatch], expressErrorMapping]
    }
  }

  [ errorMatch ] (error) {
    logger.log('errorMatch begin')
    const status = match(this.options.errorMatch || [], error.body.message, 500)
    logger.log('sending error response', { status })
    error.parameters.status = status
    return Promise.resolve(error)
  }

  pipe (array, functionArgs, output) {
    return Promise.reduce(array,
      (accumulator, currentElement) => {
        return currentElement.call(this, accumulator, ...functionArgs)
      },
      output)
  }

  getHandler () {
    // utility for express
    return this.open.bind(this)
  }

  open (...args) {
    logger.log('processing message')
    let input = {
      parameters: {},
      body: {}
    }
    let output = { parameters: {}, body: {} }

    logger.log('mapping message input')
    const inputPipeArgs = [].concat(args)
    this.pipe(this.options.inputMappings, inputPipeArgs, input)
      .then(handlerInput => this.handler(handlerInput))
      .then(processOutput => {
        logger.log('mapping message process output', {output})
        output = processOutput
        const outputPipeArgs = [input].concat(args)
        return this.pipe(this.options.outputMappings, outputPipeArgs, output)
      })
      .catch(error => {
        logger.log('error mapping')
        output = { parameters: {}, body: error }
        const errorPipeArgs = [input].concat(args)
        return this.pipe(this.options.errorMappings, errorPipeArgs, output)
      })
      .then(() => {
        logger.log('finally mapping')
        const finallyPipeArgs = [input].concat(args)
        return this.pipe(this.options.finallyMappings, finallyPipeArgs, output)
      })
  }
}
