const assert = require('assert')
const promisify = require('util').promisify
const {readFile, stat, readdir} = require('fs')
const readFileAsync = promisify(readFile)
const statAsync = promisify(stat)
const readdirAsync = promisify(readdir)
const pathJoin = require('path').join
const debug = require('debug')('good-web:frontend:parser')

const clientDir = pathJoin(__dirname, '../client')
const commonDir = pathJoin(clientDir, 'common')

const checkFile = async (dir, fileName = '') => {
  try {
    const statInfo = await statAsync(pathJoin(dir, fileName))
    return statInfo.isFile()
  } catch (e) {
    return false
  }
}

const loadJsonAsync = async (dir) => {
  const info = await readFileAsync(dir, 'utf8')
  return JSON.parse(info)
}

const checkComponent = async (componentDir, name) => {
  debug(`checkDes: ${name} - ${componentDir}`)
  try {
    const componentName = (await loadJsonAsync(pathJoin(componentDir, 'component.json'))).name
    return name ? (componentName === name) : !!componentName
  } catch (e) {
    return false
  }
}

const retrieve = async (name, parentDir) => {
  // inside components direction
  const insideDir = pathJoin(parentDir, 'components', name)
  if (await checkComponent(insideDir, name)) return insideDir

  // common components direction
  const commDir = pathJoin(commonDir, 'components', name)
  if (insideDir === commonDir) return ''

  if (await checkComponent(commDir, name)) return commDir

  return ''
}

const componentIns = (des) => {
  return Object.assign({}, des, {
    html: '',
    js: '',
    css: '',
    assets: [],
    deps: []
  })
}

/**
 * 编译组件
 * 
 * TODO:
 * 1. 文件目录需替换成相对目录，以便之后 server 代理 和 CDN 使用
 * 
 * @param {String} componentDir 组件目录
 * @return {Object} 编译后的组件信息
 * @api public
 */
const parser = async (componentDir) => {
  debug(`compiling: ${componentDir}`)

  assert(await checkComponent(componentDir), `component compile fail: no component found at ${componentDir}`)

  const des = await loadJsonAsync(pathJoin(componentDir, 'component.json'))
  const {name, dependencies} = des

  const component = componentIns(des)
  component.dir = componentDir

  // append dependencies
  const depNames = (typeof dependencies === 'object') ? Object.keys(dependencies) : []
  if (depNames.length) {
    const componentsDir = await Promise.all(depNames.map((name) => retrieve(name, componentDir)))
    component.deps = await Promise.all(componentsDir.map(parser))
  }

  // html
  const htmlFilePath = pathJoin(componentDir, `${name}.html`)
  if (await checkFile(htmlFilePath)) {
    component.html = htmlFilePath
  }

  // js
  const jsFilePath = pathJoin(componentDir, `${name}.js`)
  if (await checkFile(jsFilePath)) {
    component.js = jsFilePath
  }

  // css
  const cssFilePath = pathJoin(componentDir, `${name}.css`)
  if (await checkFile(cssFilePath)) {
    component.css = cssFilePath
  }

  // data
  const dataFilePath = pathJoin(componentDir, `${name}.json`)
  if (await checkFile(dataFilePath)) {
    component.data = await loadJsonAsync(dataFilePath)
  } else {
    component.data = {}
  }

  // assets
  const dirs = await readdirAsync(componentDir)
  const specificDirs = [htmlFilePath, jsFilePath, cssFilePath, dataFilePath]
  component.assets = dirs
    .filter((subDir) => !specificDirs.includes(subDir))
    .map((subDir) => pathJoin(componentDir, subDir))

  return component
}

module.exports = parser

// for test
// const pagesDir = pathJoin(clientDir, 'pages')
// parser(pathJoin(pagesDir, 'home')).then((component) => {
//   console.log(JSON.stringify(component))
// }).catch((e) => {
//   console.log(e)
// })
