const promisify = require('util').promisify
const {
  readFile, readdir, writeFile, createReadStream, createWriteStream, stat
} = require('fs')
const mkdirP = require('mkdirp')
const readFileAsync = promisify(readFile)
const readdirAsync = promisify(readdir)
const writeFileAsync = promisify(writeFile)
const mkdirPAsync = promisify(mkdirP)
const statAsync = promisify(stat)
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

  await mkdirPAsync(dest).catch((error) => {
    if (error.code !== 'EEXIST') {
      throw error
    }
  })
  await writeFileAsync(pathJoin(dest, `${name}.html`), html)
  await writeFileAsync(pathJoin(dest, infoFileName), JSON.stringify(info, 2, 2))

  const excepts = [mdFileName, infoFileName]
  const files = await readdirAsync(dir)
  const promises = files
    .filter((fileName = '') => excepts.indexOf(fileName.toLowerCase()) < 0)
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

  const promises = files.filter((fileName) => !/^\./.test(fileName))
    .map(async (fileName) => {
      const fullDir = pathJoin(dir, fileName)
      const info = await readJsonFileAsync(pathJoin(fullDir, 'info.json')).catch((err) => {
        if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
          return {}
        }

        throw err
      })

      info.name = info.name || fileName
      info.properties = info.properties || {}

      if (!info.createdAt) {
        const stat = await statAsync(pathJoin(fullDir, `${info.name}.md`))
        info.createdAt = stat.birthtime.toLocaleString()
      }

      info.dir = fullDir
      info.dest = pathJoin(destDir, info.name)
      info.imgBase = pathJoin(opts.imgBase, info.name)

      const html = await render(pathJoin(fullDir, `${info.name}.md`), info)
      await pub(html, info)

      return {
        name: info.name,
        createdAt: info.createdAt,
        properties: info.properties
      }
    })

  const infos = await Promise.all(promises)

  await writeFileAsync(pathJoin(destDir, 'info.json'), JSON.stringify(infos, 2, 2))
}

compiler.render = render

module.exports = compiler

if (process.env.MD) {
  const mdDir = pathJoin(__dirname, '../docs')
  const destDir = pathJoin(__dirname, '../../public/docs')
  const imgBase = `/static/docs/`

  compiler(mdDir, {
    destDir,
    imgBase
  }).then(() => {
    console.log('markdown publish success')
  }).catch((err) => console.log('markdown publish fail', err))
}
