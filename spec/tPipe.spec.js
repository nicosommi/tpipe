import TPipe, { expressResponseMapping, expressErrorMapping } from '../source/lib/tPipe.js'
import sinon from 'sinon'

describe('TPipe', () => {
  let tPipe,
    handler,
    options,
    sendSpy,
    statusSpy

  describe('(properties)', () => {
    beforeEach(() => {
      handler = sinon.spy(() => Promise.resolve({ parameters: {}, body: {} }))
      options = {}
      tPipe = new TPipe(handler, options)
    })

    it('should set the handler property', () => {
      tPipe.handler.should.eql(handler)
    })

    it('should set the options property', () => {
      tPipe.options.should.eql(options)
    })
  })

  describe('(getThunk)', () => {
    beforeEach(() => {
      handler = sinon.spy(() => Promise.resolve({ parameters: {}, body: {} }))
      options = {}
      tPipe = new TPipe(handler, options)
    })

    it('should return a function', () => {
      (typeof tPipe.getThunk()).should.equal('function')
    })

    it('should return a function that returns a function', () => {
      (typeof tPipe.getThunk()()).should.equal('function')
    })

    it('should return a function that returns a function', done => {
      const dispatch = () => {}
      const arg1 = { name: 'test' }
      const arg2 = 22
      tPipe.open = function fake (...args) {
        args[0].should.deepEqual(arg1)
        args[1].should.deepEqual(arg2)
        args[2].should.deepEqual(dispatch)
        done()
      }
      tPipe.getThunk()(arg1, arg2)(dispatch)
    })
  })

  describe('(handlers)', () => {
    let req, res

    beforeEach(() => {
      handler = sinon.spy(() => Promise.resolve({ parameters: {}, body: {} }))
      options = {}
      tPipe = new TPipe(handler, options)
      statusSpy = sinon.spy()
      req = {}
      res = {
        status: (status) => {
          statusSpy(status)
          return res
        },
        send: sendSpy
      }
    })

    describe('(open)', () => {
      it('should finish', done => {
        sendSpy = sinon.spy(() => {
          done()
        })
        res.send = sendSpy
        return tPipe.open(req, res)
      })

      describe('(input handling)', () => {
        let output

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

          options = {}
          output = {
            data: {
              id: 21,
              attributes: {}
            }
          }

          handler = sinon.spy(
            () => {
              return Promise.resolve({ parameters: {}, body: output })
            }
          )
        })

        describe('(when no mappings)', () => {
          describe('(when success)', () => {
            beforeEach(done => {
              tPipe = new TPipe(handler, options)
              sendSpy = sinon.spy(() => {
                done()
              })
              res.send = sendSpy
              tPipe.open(req, res)
            })
            it('should use the input params by default', () => {
              sinon.assert.calledWith(handler, {
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
              })
            })

            it('should return the output as is', () => {
              sinon.assert.calledWith(sendSpy, output)
            })

            it('should return the status as is', () => {
              sinon.assert.calledWith(statusSpy, 200)
            })
          })

          describe('(when it fails)', () => {
            let error

            beforeEach(done => {
              error = new Error('Not found')
              handler = sinon.spy(
                () => {
                  return Promise.reject(error)
                }
              )
              tPipe = new TPipe(handler, options)
              sendSpy = sinon.spy(() => {
                done()
              })
              res.send = sendSpy
              tPipe.open(req, res)
            })

            it('should return the error as the body when it fails', () => {
              sinon.assert.calledWith(sendSpy, error)
            })

            it('should return the status when it fails', () => {
              sinon.assert.calledWith(statusSpy, 500)
            })
          })
        })

        describe('(when input mappings)', () => {
          let newInput

          beforeEach(done => {
            req = {
              params: {
                id: 297
              },
              body: {
                name: 'Bender'
              }
            }
            newInput = { parameters: {}, body: { id: 298, name: 'Fry' } }
            options.inputMappings = [input => {
              delete input.parameters.id
              input.body.id = 298
              return Promise.resolve(input)
            },
              input => {
                input.body.name = 'Fry'
                return Promise.resolve(input)
              }]
            tPipe = new TPipe(handler, options)
            sendSpy = sinon.spy(() => {
              done()
            })
            res.send = sendSpy
            tPipe.open(req, res)
          })

          it('should use the input mapping if provided', () => {
            sinon.assert.calledWith(handler, newInput)
          })
        })

        describe('(when ouput mappings)', () => {
          let newOutput

          beforeEach(done => {
            req = {
              params: {
                id: 297
              },
              body: {
                name: 'Bender'
              }
            }
            newOutput = { id: 297, name: 'Bender', cuid: 'asjhghh388' }
            options.outputMappings = [(currentOutput, input) => {
              currentOutput.parameters.status = 201
              currentOutput.body = { cuid: 'asjhghh388' }
              return Promise.resolve(currentOutput)
            },
              (currentOutput, input) => {
                currentOutput.body.name = input.body.name
                currentOutput.body.id = input.parameters.path.id
                return Promise.resolve(currentOutput)
              }]
            tPipe = new TPipe(handler, options)
            sendSpy = sinon.spy(() => {
              done()
            })
            res.send = sendSpy
            tPipe.open(req, res)
          })

          it('should use the ouput mapping if provided', () => {
            sinon.assert.calledWith(sendSpy, newOutput)
          })

          it('should use the status mapping if provided', () => {
            sinon.assert.calledWith(statusSpy, 201)
          })
        })

        describe('(when finally mappings)', () => {
          let newOutput

          beforeEach(done => {
            req = {
              params: {
                id: 297
              },
              body: {
                name: 'Bender'
              }
            }
            newOutput = { id: 297, name: 'Bender' }
            options.finallyMappings = [
              (currentOutput, input) => {
                currentOutput.body = { name: input.body.name, id: input.parameters.path.id }
                return Promise.resolve(currentOutput)
              },
              expressResponseMapping
            ]
            tPipe = new TPipe(handler, options)
            sendSpy = sinon.spy(() => {
              done()
            })
            res.send = sendSpy
            tPipe.open(req, res)
          })

          it('should use the finally mapping if provided', () => {
            sinon.assert.calledWith(sendSpy, newOutput)
          })

          it('should use the status mapping if provided', () => {
            sinon.assert.calledWith(statusSpy, 200)
          })
        })

        describe('(when error map or match)', () => {
          describe('(when regular error string match)', () => {
            beforeEach(done => {
              options.errorMatch = [ { key: /Unauthorized/g, value: 401 } ]
              handler = sinon.spy(
                () => {
                  return Promise.reject(new Error('Unauthorized: access denied.'))
                }
              )
              tPipe = new TPipe(handler, options)
              sendSpy = sinon.spy(() => {
                done()
              })
              res.send = sendSpy
              tPipe.open(req, res)
            })

            it('should use the error matching if provided', () => {
              sinon.assert.calledWith(sendSpy, new Error('Unauthorized: access denied.'))
            })

            it('should use the error matching status if provided', () => {
              sinon.assert.calledWith(statusSpy, 401)
            })
          })

          describe('(when custom error mapping)', () => {
            let date,
              expectedOutput

            beforeEach(done => {
              date = new Date()
              expectedOutput = { error: "Sorry we can't tell you what's happenning here.", date }
              options.errorMappings = [(errorOutput) => {
                errorOutput.parameters.status = 401
                errorOutput.body = { error: "Sorry we can't tell you what's happenning here." }
                return Promise.resolve(errorOutput)
              },
                (errorOutput) => {
                  errorOutput.body.date = date
                  return Promise.resolve(errorOutput)
                },
                expressErrorMapping]
              handler = sinon.spy(
                () => {
                  return Promise.reject(new Error('Unauthorized: access denied.'))
                }
              )
              tPipe = new TPipe(handler, options)
              sendSpy = sinon.spy(() => {
                done()
              })
              res.send = sendSpy
              tPipe.open(req, res)
            })

            it('should use the error mappings if provided', () => {
              sinon.assert.calledWith(sendSpy, expectedOutput)
            })

            it('should use the error mappings status if provided', () => {
              sinon.assert.calledWith(statusSpy, 401)
            })
          })
        })
      })
    })
  })
})
