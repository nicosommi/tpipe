import { describe, it } from 'mocha'
import Promise from '../source/lib/promise.js'

require('should')

describe('Promise', () => {
  it('should have utility methods', () => {
    Promise.should.have.property('all')
  })
})
