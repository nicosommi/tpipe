import { describe, it, beforeEach } from 'mocha'
import defaultSet, {
  requestInputMapping,
  sendResponseFinallyMapping,
  statusErrorMapping,
  getHandler
} from '../source/lib/tPipeExpress.js'
import sinon, { spy } from 'sinon'

require('should')

describe('tpipe express', () => {
  describe('mapping set', () => {
    it('should expose a default mapping set', () => {
      defaultSet.should.eql({
        inputMappings: [requestInputMapping],
        finallyMappings: [sendResponseFinallyMapping],
        errorMappings: [statusErrorMapping],
        extraProperties: {
          getHandler
        }
      })
    })
  })

  describe('input mappings', () => {
    let req

    beforeEach(() => {
      req = {
        params: {
          id: 1
        },
        query: {
          pageSize: 10,
          pageNumber: 1
        },
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          data: {
            type: 'entity',
            attributes: {
              name: 'a name'
            }
          }
        }
      }
    })

    it('should transform the express request into a pipe message', () => {
      const expectedOutput = {
        parameters: {
          path: {
            id: 1
          },
          query: {
            pageSize: 10,
            pageNumber: 1
          },
          headers: {
            'Content-Type': 'application/json'
          },
          cookies: undefined,
          session: undefined,
          user: undefined,
          req
        },
        body: {
          data: {
            type: 'entity',
            attributes: {
              name: 'a name'
            }
          }
        }
      }
      return requestInputMapping({}, req)
        .should.be.fulfilledWith(expectedOutput)
    })
  })

  describe('finally mappings', () => {
    let res, body, status

    beforeEach(() => {
      res = {
        send: spy(),
        status: spy(() => res)
      }
      status = 500
    })

    describe('(when status specified)', () => {
      beforeEach(() => {
        return sendResponseFinallyMapping(
          {
            parameters: {
              status
            },
            body
          },
          {},
          {},
          res
        )
      })

      it('should send the body passed by parameter', () => {
        sinon.assert.calledWith(res.send, body)
      })

      it('should send the status passed by parameter', () => {
        sinon.assert.calledWith(res.status, status)
      })
    })

    describe('(when no status specified)', () => {
      it('should fallback to 200', () => {
        return sendResponseFinallyMapping(
          {
            parameters: {},
            body
          },
          {},
          {},
          res
        )
        .then(() => {
          sinon.assert.calledWith(res.status, 200)
        })
      })
    })
  })

  describe('error mappings', () => {
    let status

    describe('(when status specified)', () => {
      beforeEach(() => {
        status = 401
      })

      it('should preserve the status passed by parameter', () => {
        return statusErrorMapping(
          {
            parameters: {
              status
            },
            body: {}
          }
        ).should.be.fulfilledWith(
          {
            parameters: {
              status
            },
            body: {}
          }
        )
      })
    })

    describe('(when no status specified)', () => {
      it('should fallback to 500', () => {
        return statusErrorMapping(
          {
            parameters: {},
            body: {}
          }
        ).should.be.fulfilledWith(
          {
            parameters: {
              status: 500
            },
            body: {}
          }
        )
      })
    })
  })
})
