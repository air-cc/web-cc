const assert = require('assert')
const Router = require('koa-router')
const pathJoin = require('path').join
const pages = require('./pages')
const apis = require('./apis')
const debug = require('debug')('good-web:router')

const getController = (ctrl, baseDir = pathJoin(__dirname, '../controller')) => {
  debug(`parsing router: ${ctrl}`)

  const [subPath, func] = ctrl.split('.')
  const ctrlPath = pathJoin(baseDir, subPath)
  const ctrlFunc = !func ? require(ctrlPath) : require(ctrlPath)[func]

  assert(typeof ctrlFunc === 'function', `parse router fail: ${ctrl} - controller must be a function, not ${typeof ctrlFunc}`)

  return ctrlFunc
}

const appendRouter = (route, data, allowedMethods = ['get', 'post', 'put', 'delete']) => {
  Object.keys(data).forEach((url) => {
    let info = data[url]
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

    if (!handlers.length) return

    const method = typeof info.method === 'string' ? info.method.toLowerCase() : 'get'
    assert(~allowedMethods.indexOf(method), `parse router fail: ${url} - http method ${method} is not allowed, allowedMethods: ${allowedMethods}`)

    const controllers = handlers.map((ctrl) => getController(ctrl))

    route[method](url, ...controllers)
  })
}

const router = new Router()

appendRouter(router, pages)
appendRouter(router, apis)

module.exports = router
