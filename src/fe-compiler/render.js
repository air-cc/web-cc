// 页面渲染

const promisify = require('util').promisify
const {readFile, readdir} = require('fs')
const readFileAsync = promisify(readFile)
const readdirAsync = promisify(readdir)
const componentParser = require('./component')
const templateCompiler = require('./template')
const pathJoin = require('path').join

const pageCompiler = async (component, opts = {name: '', distDir: ''}) => {
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
    publicDir = opts.distDir
  }

  const mapData = await getMapData(pageName, publicDir)
  const componentCompiled = compiledInfo(component, {mapData, pageName, publicDir})

  return componentCompiled
}

const getCompiledComponent = async (dir, opts = {name: '', distDir: ''}) => {
  const component = await componentParser(dir)
  const componentCompiled = await pageCompiler(component, opts)
  return componentCompiled
}

const jsCssParser = async ({component, urlPrefix, distDir}) => {
  const getPublicUrls = async ({exts = ['js', 'css'], urlPrefix, dir}) => {
    const files = await readdirAsync(dir)
    const publicUrls = {}
    files.forEach((filename) => {
      const ext = filename.split('.').slice(-1)[0]
      if (~exts.indexOf(ext)) {
        publicUrls[ext] = publicUrls[ext] || []
        publicUrls[ext].push(pathJoin(urlPrefix, filename))
      }
    })

    return publicUrls
  }

  const scriptWrapper = (scripts = []) => {
    return [...scripts].map((script) => `<script src="${script}"></script>`).join('\r\n')
  }

  const styleWrapper = (styles = []) => {
    return [...styles].map((style) => `<link rel="stylesheet" type="text/css" href="${style}">`).join('\r\n')
  }

  const publicUrls = await getPublicUrls({
    urlPrefix: pathJoin(urlPrefix, component.name),
    dir: pathJoin(distDir, component.name)
  })

  // js
  const js = scriptWrapper(publicUrls.js)

  // css
  const css = styleWrapper(publicUrls.css)

  return {js, css}
}

const pageParser = async ({component, data, distDir, urlPrefix = '', cache}) => {
  // html
  const template = await templateCompiler(component, {cache})
  const html = template(data)

  const {js, css} = await jsCssParser({component, distDir, urlPrefix})

  return {
    html,
    js,
    css
  }
}

/**
 * 页面渲染
 * 
 * @param {String} dir              页面目录
 * @param {String} option.title     页面标题 
 * @param {String} option.layout    页面 layout 目录 
 * @param {String} option.distDir   打包后静态资源的目录 
 * @param {String} option.urlPrefix 静态资源 url 前缀
 * @param {Object} option.data      页面数据
 */
const render = async (dir, {title = '', layout, cache, distDir = '', urlPrefix = '', data = {}}) => {
  const component = await getCompiledComponent(dir, {distDir})
  const {html, js, css} = await pageParser({component, data, distDir, urlPrefix, cache})

  const layoutComponent = await getCompiledComponent(layout, {distDir})
  const layoutTemplate = await templateCompiler(layoutComponent, {cache})
  const layoutjsCss = await jsCssParser({
    component: layoutComponent,
    urlPrefix,
    distDir
  })

  const stylesheets = `${layoutjsCss.css}\r\n${css}`
  const scripts = `${layoutjsCss.js}\r\n${js}`

  const pageHTML = layoutTemplate({title: title, body: html, stylesheets, scripts})

  return pageHTML
}

module.exports = render

// for test
if (process.env.FE) {
  const pathJoin = require('path').join
  const clientDir = pathJoin(__dirname, '../client')
  const distDir = pathJoin(__dirname, '../public')
  const componentDir = pathJoin(clientDir, 'pages/home')
  const layout = pathJoin(clientDir, 'common/components/layout')
  const urlPrefix = '/static/'

  render(componentDir, {
    distDir,
    urlPrefix,
    layout,
    title: 'cc',
    data: {page: 'home', msg: 'hello world'}
  }).then(console.log)

  // compiler(pathJoin(clientDir, 'pages/home'), {
  //   title: 'cc',
  //   layout: layoutFilePath,
  //   data: {page: 'home', msg: 'hello world'}
  // })
  //   .then(console.log)
  //   .catch(console.error)
}
