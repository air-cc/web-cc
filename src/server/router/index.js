const Router = require('koa-router')
const loader = require('./loader')
const pages = require('./pages')
const apis = require('./apis')

const router = new Router()

loader(router, pages)
loader(router, apis)

module.exports = router
