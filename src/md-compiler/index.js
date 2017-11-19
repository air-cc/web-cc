const promisify = require('util').promisify
const {
  readFile, readdir, writeFile, mkdir, createReadStream, createWriteStream
} = require('fs')
const readFileAsync = promisify(readFile)
const readdirAsync = promisify(readdir)
const writeFileAsync = promisify(writeFile)
const mkdirAsync = promisify(mkdir)
const pathJoin = require('path').join
const render = require('./render')

const readJsonFileAsync = async (dir) => {
  const content = await readFileAsync(dir, 'utf8')
  return JSON.parse(content)
}

const pub = async (html, info) => {
  const {name, dir, dest} = info
  const mdFileName = `${name}.md`
  const infoFileName = 'info.json'

  await mkdirAsync(dest)
  await writeFileAsync(pathJoin(dest, `${name}.html`), html)
  await writeFileAsync(pathJoin(dest, infoFileName), JSON.stringify(info, 2, 2))

  const excepts = [mdFileName, infoFileName]
  const files = await readdirAsync(dir)
  const promises = files
    .filter((fileName = '') => excepts.indexOf(fileName.toLowerCase()) >= 0)
    .map((fileName) => {
      const origFilePath = pathJoin(dir, fileName)
      const destFilePath = pathJoin(dest, fileName)

      return new Promise((resolve, reject) => {
        const rs = createReadStream(origFilePath)
        const ws = createWriteStream(destFilePath)

        rs.on('error', reject)
        ws.on('error', reject)
        ws.on('close', resolve)
        rs.pipe(ws)
      })
    })

  await Promise.all(promises)
}

const compiler = async (dir, opts = {destDir: ''}) => {
  const files = await readdirAsync(dir)
  const {destDir} = opts

  const promises = files
    .map(async (fileName) => {
      const fullDir = pathJoin(dir, fileName)
      const info = await readJsonFileAsync(pathJoin(fullDir, 'info.json'))

      info.dir = fullDir
      info.dest = pathJoin(destDir, info.name)
      const html = await render(dir, opts)
      await pub(html, info)
    })

  await Promise.all(promises)
}

compiler.render = render

module.exports = compiler
