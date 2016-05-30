import TPipe, { expressResponseMapping, expressErrorMapping } from '../source/lib/tPipe.js'
import sinon from 'sinon'

describe('TPipe', () => {
  let tPipe,
    handler,
    options,
    sendSpy

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

  describe('(handlers)', () => {
    let req, res

    beforeEach(() => {
      sendSpy = sinon.spy()
      req = {}
      res = {
        send: sendSpy
      }
    })

    describe('(open)', () => {
      it('should finish', done => {
        return tPipe.open(req, res, () => {
          done()
        })
      })

      describe('(input handling)', () => {
        let output

        beforeEach(() => {
          req = {
            params: {
              id: 1
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
              tPipe.open(req, res, () => {
                done()
              })
            })
            it('should use the input params by default', () => {
              sinon.assert.calledWith(handler, {
                parameters: {
                  id: 1
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
              sinon.assert.calledWith(sendSpy, 200, output)
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
              tPipe.open(req, res, () => {
                done()
              })
            })

            it('should return the error as the body when it fails', () => {
              sinon.assert.calledWith(sendSpy, 500, error)
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
            tPipe.open(req, res, () => {
              done()
            })
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
                currentOutput.body.id = input.parameters.id
                return Promise.resolve(currentOutput)
              }]
            tPipe = new TPipe(handler, options)
            tPipe.open(req, res, () => {
              done()
            })
          })

          it('should use the ouput mapping if provided', () => {
            sinon.assert.calledWith(sendSpy, 201, newOutput)
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
                currentOutput.body = { name: input.body.name, id: input.parameters.id }
                return Promise.resolve(currentOutput)
              },
              expressResponseMapping
            ]
            tPipe = new TPipe(handler, options)
            tPipe.open(req, res, () => {
              done()
            })
          })

          it('should use the finally mapping if provided', () => {
            sinon.assert.calledWith(sendSpy, 200, newOutput)
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
              tPipe.open(req, res, () => {
                done()
              })
            })

            it('should use the error matching if provided', () => {
              sinon.assert.calledWith(sendSpy, 401, new Error('Unauthorized: access denied.'))
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
              tPipe.open(req, res, () => {
                done()
              })
            })

            it('should use the error mappings if provided', () => {
              sinon.assert.calledWith(sendSpy, 401, expectedOutput)
            })
          })
        })
      })
    })
  })
})
