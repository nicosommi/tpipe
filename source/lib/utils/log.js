import debug from 'debug'

export default function getLogger (logger) {
  return new Logger(logger)
}

export class Logger {
  constructor (namespace) {
    this.debug = debug(namespace)
  }

  log (...args) {
    return new Promise(
      resolve => {
        this.debug(...args)
        resolve(args)
      }
    )
  }
}
