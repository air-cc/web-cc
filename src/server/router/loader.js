const assert = require('assert')
const pathJoin = require('path').join
const debug = require('debug')('good-web:router:loader')

const getMiddleware = (mw, baseDir) => {
  debug(`parsing router: ${mw}`)

  const [subPath, func] = mw.split('.')
  const mwPath = pathJoin(baseDir, subPath)
  const mwFunc = !func ? require(mwPath) : require(mwPath)[func]

  assert(typeof mwFunc === 'function', `parse router fail: ${mw} - controller must be a function, not ${typeof mwFunc}`)

  return mwFunc
}

const loader = (route, data, opts = {allowedMethods: ['get', 'post', 'put', 'delete'], baseDir: pathJoin(__dirname, '../controller')}) => {
  const allowedMethods = opts.allowedMethods || ['get', 'post', 'put', 'delete']
  const baseDir = opts.baseDir || pathJoin(__dirname, '../controller')

  Object.keys(data).forEach((url) => {
    const info = data[url]

    const method = typeof info.method === 'string' ? info.method.toLowerCase() : 'get'

    assert(~allowedMethods.indexOf(method), `parse router fail: ${url} - http method ${method} is not allowed, allowedMethods: ${allowedMethods}`)

    let handlers = []
    if (typeof info === 'string') {
      handlers = [info]
    }

    if (Array.isArray(info)) {
      handlers = info
    }

    if (info.controller) {
      handlers = Array.isArray(info.controller) ? info.controller : [info.controller]
    }

    assert(handlers.length, `parse router fail: ${url} - no controller found, at least one`)

    const middlewares = handlers.map((mw) => getMiddleware(mw, baseDir))

    route[method](url, ...middlewares)
  })
}

module.exports = loader
