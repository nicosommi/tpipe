import TPipe, { expressRequestMapping, expressResponseMapping, expressErrorMapping } from '../source/lib/tPipe.js'
import piper from '../source/lib/piper.js'
import should from 'should'

describe('lib', () => {
  const expectedExportedObject = {
    default: TPipe,
    piper,
    expressErrorMapping,
    expressRequestMapping,
    expressResponseMapping
  }

  Object.keys(expectedExportedObject).forEach(
    exportedKey => {
      it('should export default as supposed', () => {
        require('../source/lib/lib.js')[exportedKey].should.eql(expectedExportedObject[exportedKey])
      })
    }
  )
})
