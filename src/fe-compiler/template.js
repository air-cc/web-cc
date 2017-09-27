// html 模板编译

const promisify = require('util').promisify
const {readFile} = require('fs')
const readFileAsync = promisify(readFile)
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')
const pathJoin = require('path').join

handlebars.registerHelper(layouts(handlebars))

const _templates = {}
const _cache = new Set()

// const getHTMLContent = async (name, filePath) => {
//   const mapFile = pathJoin(compiledHTMLDir, name, 'html-map.json')
//   const mapDataStr = await readFileAsync(mapFile, 'utf8')
//   const mapData = JSON.stringify(mapDataStr)
//   const realFilePath = mapData[filePath]
//   const htmlData = await readFileAsync(realFilePath, 'utf8')

//   return htmlData
// }

const registerPartial = async (name, filePath) => {
  if (_cache.has(name)) return true
  if (!filePath) return false

  const tempContent = await readFileAsync(filePath, 'utf8')
  handlebars.registerPartial(name, tempContent)
  _cache.add(name)

  return true
}

const templateIns = async (name, filePath) => {
  if (name !== 'layout' && _templates[name]) return _templates[name]
  if (!filePath) return null

  const content = await readFileAsync(filePath, 'utf8')
  const template = _templates[name] = handlebars.compile(content)
  return template
}

// template compile
const compiler = async ({name, html, deps}) => {
  let template = await templateIns(name)
  if (template) return template

  // dependencies
  if (deps.length) {
    await Promise.all(deps.map(compiler))
  }

  // self
  await registerPartial(name, html)

  template = await templateIns(name, html)
  return template
}

const pageCompiler = async (component, opts = {name: '', public: ''}) => {
  const getMapData = async (name, publicDir) => {
    const mapFile = pathJoin(publicDir, name, 'resources-map.json')
    const mapDataStr = await readFileAsync(mapFile, 'utf8')
    const mapData = JSON.parse(mapDataStr)

    return mapData
  }

  const compiledInfo = (component, {mapData, pageName, publicDir}) => {
    const {html, deps} = component

    if (deps.length) {
      component.deps = deps.map((dep) => {
        return compiledInfo(dep, {mapData, pageName, publicDir})
      })
    }

    component.originHTML = component.html
    component.html = pathJoin(publicDir, pageName, mapData[html])

    return component
  }

  let pageName = ''
  let publicDir = ''

  if (typeof opts === 'string') {
    pageName = component.name
    publicDir = opts
  } else {
    pageName = opts.name || component.name
    publicDir = opts.public
  }

  const mapData = await getMapData(pageName, publicDir)
  const componentCompiled = compiledInfo(component, {mapData, pageName, publicDir})

  const template = await compiler(componentCompiled)
  return template
}

compiler.pageCompiler = pageCompiler
compiler.templateIns = templateIns
compiler.registerPartial = registerPartial

module.exports = compiler
