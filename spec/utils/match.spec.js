import match from '../../source/lib/utils/match.js'

describe('match', () => {
  it('should return the property value correctly if the string matches', () => {
    const source = [
      { key: /[\w\s]+/, value: 23 }
    ]
    match(source, 'myproperty is wonderful').should.equal(23)
  })

  it('should return the property value correctly if the string matches two times in a row', () => {
    const source = [
      { key: /[\w\s]+/, value: 23 }
    ]
    let res = match(source, 'myproperty is wonderful')
    res = match(source, 'myproperty is wonderful')
    res.should.equal(23)
  })
})
