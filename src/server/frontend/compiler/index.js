const pathJoin = require('path').join
const componentParser = require('./component')
const templateCompiler = require('./template')
const scriptCompiler = require('./script')
const styleCompiler = require('./stylesheet')

const scriptWrapper = (scripts) => {
  return [...scripts].map((script) => `<script src="${script}"></script>`).join('\r\n')
}

const styleWrapper = (styles) => {
  return [...styles].map((style) => `<link rel="stylesheet" type="text/css" href="${style}">`).join('\r\n')
}

const pageParser = async (component, data) => {
  // html
  const template = await templateCompiler(component)
  const html = template(data)

  // js
  const scripts = await scriptCompiler(component)
  const js = scriptWrapper(scripts)

  // css
  const styles = await styleCompiler(component)
  const css = styleWrapper(styles)

  return {
    html,
    js,
    css
  }
}

// for render
const compiler = async (dir, {page, data}) => {
  const component = await componentParser(dir)

  const {html, js, css} = await pageParser(component, data)
  const layoutTemplate = await templateCompiler.templateIns('layout', page.layout)
  const pageHTML = layoutTemplate({title: page.title, body: html, stylesheets: css, scripts: js})

  return pageHTML
}

module.exports = compiler

// for test
// const clientDir = pathJoin(__dirname, '../../../client')
// const layoutFilePath = pathJoin(clientDir, 'common/components/layout/layout.html')
// compiler(pathJoin(clientDir, 'pages/home'), {
//   page: {title: 'cc', layout: layoutFilePath},
//   data: {page: 'home', content: 'hello world'}
// })
//   .then(console.log)
//   .catch(console.error)
