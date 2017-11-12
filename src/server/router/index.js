const Router = require('koa-router')
const loader = require('./loader')
const pages = require('./routes/pages')
const apis = require('./routes/apis')

const router = new Router()

loader(router, pages)
loader(router, apis)

module.exports = router
