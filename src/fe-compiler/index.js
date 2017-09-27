const pathJoin = require('path').join
const {promisify} = require('util')
const {readdir, stat} = require('fs')
const readdirAsync = promisify(readdir)
const statAsync = promisify(stat)

const componentParser = require('./component')
const assetsCompiler = require('./assetsCompiler')

const isDirectory = async (dir, fileName = '') => {
  try {
    const statInfo = await statAsync(pathJoin(dir, fileName))
    return statInfo.isDirectory()
  } catch (e) {
    return false
  }
}

const compiler = async ({componentDir, distDir, urlPrefix}) => {
  const component = await componentParser(componentDir)

  urlPrefix = urlPrefix.match(/\/$/) ? urlPrefix : `${urlPrefix}/`
  const {publicMap} = await assetsCompiler({component, distDir, urlPrefix})

  return publicMap
}

const traverser = async ({entry, layout, urlPrefix, distDir}) => {
  const files = await readdirAsync(entry)
  const results = await Promise.all(files.map((filename) => isDirectory(entry, filename)))
  const componentDirs = files.filter((filename, index) => results[index]).map((filename) => {
    return {name: filename, componentDir: pathJoin(entry, filename)}
  })
  componentDirs.push({name: 'layout', componentDir: layout})

  const result = await Promise.all(
    componentDirs.map(({name, componentDir}) => compiler({
      componentDir,
      distDir: pathJoin(distDir, name),
      urlPrefix: pathJoin(urlPrefix, name)
    }))
  )

  return result
}

compiler.traverser = traverser

module.exports = compiler

// for test
if (process.env.FE) {
  const distDir = pathJoin(__dirname, '../public')
  const clientDir = pathJoin(__dirname, '../client')
  const layout = pathJoin(clientDir, 'common/components/layout')
  const entry = pathJoin(clientDir, 'pages')
  const urlPrefix = '/static'

  traverser({layout, entry, urlPrefix, distDir}).then(console.log)
}
