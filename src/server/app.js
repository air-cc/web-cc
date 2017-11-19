const Koa = require('koa')
const stetic = require('koa-better-serve')
const pathJoin = require('path').join
const debug = require('debug')('good-web:app')
const router = require('./router')
const render = require('./middlewares/render')
const markdown = require('./middlewares/markdown')
const config = require('./config')

const app = new Koa()

const urlPrefix = '/static'
const distDir = pathJoin(__dirname, '../../public')

app.use(render({
  pages: pathJoin(__dirname, '../client/pages'),
  layout: pathJoin(__dirname, '../client/common/components/layout'),
  distDir,
  urlPrefix,
  cache: false
}))

app.use(markdown({
  docs: pathJoin(__dirname, '../docs'),
  template: 'article',
  imgBase: `${urlPrefix}/docs/`,
  distDir
}))

app.use(router.routes())
app.use(router.allowedMethods())

app.use(stetic(distDir, urlPrefix)) // 注意 static 路由加载必须在 router 后面

// 启动服务监听
app.run = (cb) => {
  const server = app.listen(config.app.port, '127.0.0.1', () => {
    debug('app running')
    const address = server.address()
    console.log(`server listening at: http://${address.address}:${address.port}`)

    if (typeof cb === 'function') {
      cb()
    }
  })

  return server
}

if (module === require.main) {
  app.run()
}

module.exports = app
