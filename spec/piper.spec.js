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
  })
})
