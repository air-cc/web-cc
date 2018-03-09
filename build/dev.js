const pathJoin = require('path').join
const build = require('./build.js')
const config = require('../src/server/config')
const app = require('../src/server/app.js')
const browserSync = require('browser-sync')

const { compileFE, compileMD } = build
const clientDir = pathJoin(__dirname, '../src/client')
const docsDir = pathJoin(__dirname, '../src/docs')

async function run () {
  await build()
  return new Promise((resolve) => app.run(resolve))
}

run().then(() => {
  const bs = browserSync.create()

  bs.init({
    proxy: `http://127.0.0.1:${config.app.port}`
  })

  bs.watch(clientDir).on('change', () => {
    compileFE().then(bs.reload)
  })

  bs.watch(docsDir).on('change', () => {
    compileMD().then(bs.reload)
  })
})
