const Koa = require('koa')
const debug = require('debug')('good-web:app')
const router = require('./router')
const config = require('./config')

const app = new Koa()

app.use(router.routes())
app.use(router.allowedMethods())

const server = app.listen(config.app.port, '127.0.0.1', () => {
  debug('app running')

  const address = server.address()
  console.log(`server listening at: http://${address.address}:${address.port}`)
})
