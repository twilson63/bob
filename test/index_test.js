const test = require('tape')

const createApp = require('../')

const clean1 = {
  name: 'clean1',
  foo() {
    return (app) => {
      return 'beep'
    }
  }
}

const clean2 = {
  name: 'clean2',
  bar() {
    return () => {
      return 'bar'
    }
  },
  baz() {

  }
}

test('compose cleanComponents', t => {
  const app = createApp([clean1, clean2])

  t.equal(app.clean1.foo(), 'beep')
  t.end()
})

test('validate object', t => {
  try {
    const app = createApp([clean1, clean2, 'foo'])
  } catch (e) {
    t.equal(e.message, 'all business objects must be objects')
    t.end()
  }
})

test('validate name property', t => {
  try {
    const app = createApp([clean1, clean2, {}])
  } catch (e) {
    t.equal(e.message, 'All business objects must have [name] property')
    t.end()
  }
})

test('all business object functions should return function', t => {
  try {
    const app = createApp([clean1, clean2])
    app.clean2.baz()
  } catch (e) {
    t.equal(e.message, 'All business object functions should return a [Function]')
    t.end()
  }
})

test('access details within business object without dependency', t => {
  const boFoo = { name: 'foo', beep: () => ({ details }) => details.doSomething ? details.doSomething() : null }
  const app = createApp([clean1, clean2, boFoo], { doSomething: () => 'Hello' })
  t.equal(app.foo.beep(), 'Hello')
  t.end()
})
