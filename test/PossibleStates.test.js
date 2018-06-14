/* eslint-env jest */

import PossibleStates from '../lib'

describe('with simple values', () => {
  let ui

  beforeEach(() => {
    ui = PossibleStates('a', 'b', 'c')
  })

  test('uses the first values as the default', () => {
    expect(ui.current()).toBe('a')
  })

  test('error when no states passed', () => {
    expect(() => PossibleStates()).toThrow(Error)
  })

  test('has to___() transitions helpers', () => {
    expect(ui.toA).toBeInstanceOf(Function)
    expect(ui.toB).toBeInstanceOf(Function)
    expect(ui.toC).toBeInstanceOf(Function)
  })

  test('transitions to another state', () => {
    expect(ui.current()).toBe('a')

    ui = ui.toB()

    expect(ui.current()).toBe('b')
  })

  test('transitioned object as different transitions helpers', () => {
    ui = ui.toC()

    expect(ui.toA).toBeInstanceOf(Function)
    expect(ui.toB).toBeInstanceOf(Function)
    expect(ui.toC).toBeInstanceOf(Function)
  })

  test('is immutable', () => {
    const transitioned = ui.toC().toA()

    expect(ui).not.toBe(transitioned)
  })

  test('has when___() helpers', () => {
    expect(ui.whenA).toBeInstanceOf(Function)
    expect(ui.whenB).toBeInstanceOf(Function)
    expect(ui.whenC).toBeInstanceOf(Function)
  })

  test('when___() executes the callback when it matches', () => {
    const mock = jest.fn()

    ui.whenA(() => mock('a'))
    ui.whenB(() => mock('b'))
    ui.whenC(() => mock('c'))

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('a')
  })

  test('caseOf executes a callback based on the currentState', () => {
    const mock = jest.fn()

    ui.caseOf({
      a: () => mock('a'),
      b: () => mock('b'),
      c: () => mock('c'),
    })

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('a')
  })

  test('caseOf with a catch all clause', () => {
    const mock = jest.fn()

    ui.caseOf({
      c: () => mock('c'),
      _: () => mock('catch all'),
    })

    expect(mock).toHaveBeenCalledTimes(1)
    expect(mock).toHaveBeenCalledWith('catch all')
  })

  test('caseOf without a matching clause', () => {
    expect(() => ui.caseOf({a: () => {}})).toThrow(Error)
  })
})

describe('state with enclosed data', () => {
  let ui

  beforeEach(() => {
    ui = PossibleStates('a', 'b<example>', 'c')
  })

  test('has to___() helper function for container types', () => {
    expect(ui.toB).toBeInstanceOf(Function)
  })

  test('initial state cannot contain data', () => {
    expect(() => PossibleStates('a<no>')).toThrow(Error)
  })

  test('transition to a state that holds data', () => {
    ui = ui.toB('some piece of data')

    expect(ui.data()).toEqual({example: 'some piece of data'})
  })

  test('transition with wrong number of args throws an error', () => {
    expect(() => ui.toB()).toThrow(Error)
  })

  test('when has arguments in its callback', () => {
    ui.toB('so long!').whenB(args => {
      expect(args).toEqual({example: 'so long!'})
    })
  })

  test('caseOf has arguments in its callback', () => {
    ui.toB('so long!').caseOf({
      b: args => expect(args).toEqual({example: 'so long!'}),
      _: () => {},
    })
  })
})

describe('type with multiple data in it', () => {
  test('a state that holds multiple pieces data', () => {
    const ui = PossibleStates('a', 'b<first, second>').toB('foo', 'bar')

    expect(ui.data()).toEqual({first: 'foo', second: 'bar'})
  })

  test('invalid number of args when multiple needed', () => {
    expect(() => PossibleStates('a', 'b<first, second>').toB('foo')).toThrow(Error)
  })
})
