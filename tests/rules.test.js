const { getNeighbors, iteration } = require('../rules')

describe('rules', () => {
  test('#getNeighbors', () => {
    expect(getNeighbors(0, 1, '123')).toBe('312');
    expect(getNeighbors(1, 1, '123')).toBe('123');
    expect(getNeighbors(2, 1, '123')).toBe('231');
    expect(getNeighbors(3, 1, '123')).toBe('312');
  })

  test('#iteration', () => {
    expect(iteration('101', 1, '01010101')).toBe('011');
  })
})