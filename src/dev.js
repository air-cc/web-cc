const pathJoin = require('path').join
const fe = require('./fe-compiler')
const app = require('./server/app.js')

const distDir = pathJoin(__dirname, 'public')
const clientDir = pathJoin(__dirname, 'client')
const layout = pathJoin(clientDir, 'common/components/layout')
const entry = pathJoin(clientDir, 'pages')
const urlPrefix = '/static'

async function compileFE () {
  await fe({ layout, entry, urlPrefix, distDir })
}

async function run () {
  await compileFE()
  return new Promise((resolve) => app.run(resolve))
}

run().then(() => {
  const config = require('./server/config')
  const bs = require('browser-sync').create()

  bs.init({
    proxy: `http://127.0.0.1:${config.app.port}`
  })

  bs.watch(clientDir).on('change', () => {
    compileFE().then(bs.reload)
  })
})
