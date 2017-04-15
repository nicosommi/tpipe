import { describe, it } from 'mocha'
import getLogger from '../../source/lib/utils/log.js'

require('should')

const logger = getLogger('test')

describe('log', () => {
  it('should log', () => {
    return logger.log({}, 'to.my.value')
      .should.be.fulfilled()
  })
})
