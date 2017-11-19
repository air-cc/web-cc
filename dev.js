const pathJoin = require('path').join
const fe = require('./src/fe-compiler')
const app = require('./src/server/app.js')

const distDir = pathJoin(__dirname, 'public')
const clientDir = pathJoin(__dirname, './src/client')
const layout = pathJoin(clientDir, 'common/components/layout')
const entry = pathJoin(clientDir, 'pages')
const urlPrefix = '/static'

const serverDir = pathJoin(__dirname, './src/server')

async function compileFE () {
  await fe({ layout, entry, urlPrefix, distDir })
}

async function compileMD () {
  return null
}

async function run () {
  await compileFE()
  await compileMD()
  return new Promise((resolve) => app.run(resolve))
}

run().then(() => {
  const config = require('./src/server/config')
  const bs = require('browser-sync').create()

  bs.init({
    proxy: `http://127.0.0.1:${config.app.port}`
  })

  bs.watch(clientDir).on('change', () => {
    compileFE().then(bs.reload)
  })

  bs.watch(serverDir).on('change', () => {
    console.log('need restart server')
  })
})
