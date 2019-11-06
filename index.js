const { reduce, assoc, keys, all, equals, has, 
  append, compose, is, not
} = require('ramda')

/**
 * create app bundler
 *
 * take one to many objects with a name prop
 * and HOF functions
 */
let app = {}
let appDetails = {}

const isObject = all(is(Object))

const hasName = compose(
  all(equals(true)),
  reduce((a,v) => append(has('name', v), a), [])
)

/**
 * createApp
 *
 * take 1 or more BO bundles and return a super object 
 * with each BO mapped by name properties
 *
 * @param {array} bizObjs - BusinessObjects with name property
 * @param {object} details - implementation details
 *
 * @return {object}
 *
 */
module.exports = function (bizObjs, details={}) {
  if (not(is(Object, details))) {
    throw new Error('details must be an [Object]')
  }
  // each bundle must be an object
  if (!isObject(bizObjs)) {
    throw new Error('all business objects must be objects')
  }
  // each bundle must have a name property
  if (!hasName(bizObjs)) { 
    throw new Error('All business objects must have [name] property') 
  } 
  // set details
  appDetails = details
  // build super Busines Object
  app = reduce((container, bizObj) => {
    // wrap functions with details
    bizObj = reduce(rewrap(bizObj), {}, keys(bizObj))
    // add object to container
    return assoc(bizObj.name, bizObj, container)
  }, app, bizObjs)
  return app
}

/*
 * rewrap each function in the bundle 
 * to add the app object to each HOF
 *
 * @param {object} bundle - pure Business Object
 * @return {object} - new BusinessObjects with wrappers
 */
function rewrap(bundle) {
  return (acc, key) => {
    if (key === 'name') { return assoc('name', bundle.name, acc) }
    if (typeof bundle[key] === 'function') {
      const fn = bundle[key]
      acc[key] = function (...args) {
        const injectFn = fn(...args)
        if (is(Function, injectFn)) {
          return injectFn({ app, details: appDetails })
        }
        throw new Error('All business object functions should return a [Function]')
      }
      return acc
    }
  }
}
