// html 模板编译

const promisify = require('util').promisify
const {readFile} = require('fs')
const readFileAsync = promisify(readFile)
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')
const pathJoin = require('path').join

handlebars.registerHelper(layouts(handlebars))

const _templates = {}
const tmplGet = (name) => {
  return _templates[name]
}

const tmplAdd = (name, data) => {
  _templates[name] = data
}

const _partials = new Set()
const partHas = (name) => {
  return _partials.has(name)
}

const partAdd = (name) => {
  _partials.add(name)
}

const registerPartial = async (name, filePath, cache) => {
  if (cache && partHas(name)) return true

  if (!filePath) return false

  const tempContent = await readFileAsync(filePath, 'utf8')
  handlebars.registerPartial(name, tempContent)

  cache && partAdd(name)

  return true
}

const templateIns = async (name, filePath, cache) => {
  let template = tmplGet(name)
  if (cache && template) return template

  if (!filePath) return null

  const content = await readFileAsync(filePath, 'utf8')
  template = handlebars.compile(content)

  cache && tmplAdd(name, template)

  return template
}

// template compile
const compiler = async ({name, html, deps}, opt = {cache: false}) => {
  const cache = opt.cache
  let template = await templateIns(name, null, cache)
  if (template) return template

  // dependencies
  if (deps.length) {
    await Promise.all(deps.map(compiler))
  }

  // self
  await registerPartial(name, html, cache)

  template = await templateIns(name, html, cache)
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
