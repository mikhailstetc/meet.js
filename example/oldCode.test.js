const isRed = str => str === 'RED'
const isGreen = str => str === 'GREEN'
const isBlue = str => str === 'BLUE'

describe('My test suite', () => {
  it('Tests something', () => {
    const string1 = 'RED'
    const string2 = 'GREEN'
    const string3 = 'BLUE'

    expect(isRed(string1)).toBeTruthy()
    expect(isGreen(string2)).toBeTruthy()
    expect(isBlue(string3)).toBeTruthy()

    expect(isRed(string3)).toBeFalsy()
    expect(isGreen(string1)).toBeFalsy()
    expect(isBlue(string2)).toBeFalsy()
  })
})
