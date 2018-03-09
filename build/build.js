const pathJoin = require('path').join
const fe = require('../src/fe-compiler')
const md = require('../src/md-compiler')

const clientDir = pathJoin(__dirname, '../src/client')

async function compileFE () {
  const distDir = pathJoin(__dirname, '../public')
  const layout = pathJoin(clientDir, 'common/components/layout')
  const entry = pathJoin(clientDir, 'pages')
  const urlPrefix = '/static'
  await fe({ layout, entry, urlPrefix, distDir })
}

async function compileMD () {
  const mdDir = pathJoin(__dirname, '../src/docs')
  const destDir = pathJoin(__dirname, '../public/docs')
  const imgBase = `/static/docs/`

  await md(mdDir, {
    destDir,
    imgBase
  })
}

function build () {
  return Promise.all([compileFE(), compileMD()])
}

if (module === require.main) {
  build().then(() => {
    console.log('frontend build ok')
  })
}

build.compileFE = compileFE
build.compileMD = compileMD
module.exports = build
