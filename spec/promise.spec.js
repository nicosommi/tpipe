import Promise from '../source/lib/promise.js'

describe('Promise', () => {
  it('should have utility methods', () => {
    Promise.should.have.property('all')
  })
})
