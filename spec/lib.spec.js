import TPipe from '../source/lib/tPipe.js'
import {
  requestInputMapping,
  sendResponseFinallyMapping,
  statusErrorMapping
} from '../source/lib/tPipeExpress.js'
import piper from '../source/lib/piper.js'

describe('lib', () => {
  const expectedExportedObject = {
    default: TPipe,
    piper,
    statusErrorMapping,
    requestInputMapping,
    sendResponseFinallyMapping
  }

  Object.keys(expectedExportedObject).forEach(
    exportedKey => {
      it('should export default as supposed', () => {
        require('../source/lib/lib.js')[exportedKey].should.eql(expectedExportedObject[exportedKey])
      })
    }
  )
})
