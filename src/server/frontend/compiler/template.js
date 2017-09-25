// html 模板编译

const promisify = require('util').promisify
const {readFile} = require('fs')
const readFileAsync = promisify(readFile)
const handlebars = require('handlebars')
const layouts = require('handlebars-layouts')

handlebars.registerHelper(layouts(handlebars))

const _templates = {}
const _cache = new Set()

const registerPartial = async (name, filePath) => {
  if (_cache.has(name)) return true
  if (!filePath) return false

  const tempContent = await readFileAsync(filePath, 'utf8')
  handlebars.registerPartial(name, tempContent)
  _cache.add(name)

  return true
}

const templateIns = async (name, filePath) => {
  if (_templates[name]) return _templates[name]
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

compiler.templateIns = templateIns

module.exports = compiler
