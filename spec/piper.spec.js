import piper from '../source/lib/piper.js'
import TPipe from '../source/lib/tPipe.js'

describe('TPipe', () => {
  let handler
  let options
  let piperObj
  let aMapping

  beforeEach(() => {
    handler = () => {}
    aMapping = () => {}
    options = {
      inputMappings: [aMapping],
      outputMappings: [aMapping],
      errorMappings: [aMapping],
      finallyMappings: [aMapping],
      metaKey: 'parameters',
      payloadKey: 'body'
    }
    piperObj = piper(handler, options)
  })

  describe('(piper)', () => {
    describe('(default)', () => {
      it('should have a tpipe', () => {
        piperObj.pipe.constructor.should.eql(TPipe)
      })

      it('should have a tpipe with all the handler loaded', () => {
        piperObj.pipe.handler.should.eql(handler)
      })

      it('should have a tpipe with all the options loaded', () => {
        piperObj.pipe.options.should.eql(options)
      })
    })

    describe('(input)', () => {
      it('should allow to add new input methods while preseve previous', () => {
        const newInputMapping = () => {}
        const anotherInputMapping = () => {}
        piperObj.input(newInputMapping, anotherInputMapping)
        piperObj.pipe.options.inputMappings.should.eql([aMapping, newInputMapping, anotherInputMapping])
      })
    })

    describe('(output)', () => {
      it('should allow to add new output methods while preseve previous', () => {
        const newOutputMapping = () => {}
        const anotherOutputMapping = () => {}
        piperObj.output(newOutputMapping, anotherOutputMapping)
        piperObj.pipe.options.outputMappings.should.eql([aMapping, newOutputMapping, anotherOutputMapping])
      })
    })

    describe('(error)', () => {
      it('should allow to add new error methods while preseve previous', () => {
        const newErrorMapping = () => {}
        const anotherErrorMapping = () => {}
        piperObj.error(newErrorMapping, anotherErrorMapping)
        piperObj.pipe.options.errorMappings.should.eql([aMapping, newErrorMapping, anotherErrorMapping])
      })
    })

    describe('(finally)', () => {
      it('should allow to add new finally methods while preseve previous', () => {
        const newFinallyMapping = () => {}
        const anotherFinallyMapping = () => {}
        piperObj.finally(newFinallyMapping, anotherFinallyMapping)
        piperObj.pipe.options.finallyMappings.should.eql([aMapping, newFinallyMapping, anotherFinallyMapping])
      })
    })

    describe('(reset)', () => {
      it('should clear all the mappings', () => {
        piperObj.reset()
        const emptyOptions = {
          inputMappings: [],
          outputMappings: [],
          errorMappings: [],
          finallyMappings: [],
          metaKey: 'parameters',
          payloadKey: 'body'
        }
        piperObj.pipe.options.should.eql(emptyOptions)
      })

      it('should return the piper', () => {
        piperObj.reset().should.equal(piperObj)
      })
    })

    describe('(incorporate)', () => {
      it('should incorporate input mappings from a mapping set', () => {
        piperObj.reset()
        const inputMappings = [
          () => 1,
          () => 2
        ]
        const mappingSet = {
          inputMappings
        }
        piperObj.incorporate(mappingSet)
          .pipe.options.inputMappings.should.eql(inputMappings)
      })

      it('should incorporate output mappings from a mapping set', () => {
        piperObj.reset()
        const outputMappings = [
          () => 1,
          () => 2
        ]
        const mappingSet = {
          outputMappings
        }
        piperObj.incorporate(mappingSet)
          .pipe.options.outputMappings.should.eql(outputMappings)
      })

      it('should incorporate finally mappings from a mapping set', () => {
        piperObj.reset()
        const finallyMappings = [
          () => 1,
          () => 2
        ]
        const mappingSet = {
          finallyMappings
        }
        piperObj.incorporate(mappingSet)
          .pipe.options.finallyMappings.should.eql(finallyMappings)
      })

      it('should incorporate error mappings from a mapping set', () => {
        piperObj.reset()
        const errorMappings = [
          () => 1,
          () => 2
        ]
        const mappingSet = {
          errorMappings
        }
        piperObj.incorporate(mappingSet)
          .pipe.options.errorMappings.should.eql(errorMappings)
      })

      describe('(extra properties)', () => {
        it('should incorporate extra methods from a mapping set', () => {
          piperObj.reset()
          const extraProperties = {
            myMethod: function myMethodName () {}
          }
          const mappingSet = {
            extraProperties
          }
          piperObj.incorporate(mappingSet)
            .pipe.should.have.property('myMethod')
        })

        it('should bind the pipe to an extra method from a mapping set', () => {
          piperObj.reset()
          const extraProperties = {
            myMethod: function myMethodName () {
              this.should.equal(piperObj.pipe)
            }
          }
          const mappingSet = {
            extraProperties
          }
          piperObj.incorporate(mappingSet)
            .pipe.myMethod()
        })
      })
    })
  })
})
