// 模板渲染脚本

const assert = require('assert')
const pathJoin = require('path').join
const render = require('../../fe-compiler/render')

module.exports = (opts) => {
  assert(typeof opts === 'object', `render options must be an object, not ${typeof opts}`)
  assert(typeof opts.pages === 'string', `pages must be an string, not ${typeof opts.pages}`)
  assert(typeof opts.layout === 'string', `layout must be an string, not ${typeof opts.layout}`)
  assert(typeof opts.distDir === 'string', `distDir must be an string, not ${typeof opts.distDir}`)
  assert(typeof opts.urlPrefix === 'string', `urlPrefix must be an string, not ${typeof opts.urlPrefix}`)

  const pagesDir = opts.pages
  const defaultLayout = opts.layout
  const distDir = opts.distDir
  let urlPrefix = opts.urlPrefix
  urlPrefix = urlPrefix.match(/\/$/) ? urlPrefix : `${urlPrefix}/`
  const defaultCache = typeof opts.cache === 'boolean' ? opts.cache : true

  return async (ctx, next) => {
    ctx.render = async (pageName, pageData = {title: '', layout: defaultLayout, cache: defaultCache, data: {}}) => {
      const typ = (typeof pageData)
      assert(typ === 'object', `pageData must be an object or undefined`)

      const title = (typeof pageData.title === 'string') ? pageData.title : pageName
      const {layout = defaultLayout, cache = defaultCache, data = {}} = pageData
      // assert(layout, `no layout file found`)

      const dir = pathJoin(pagesDir, pageName)
      const html = await render(dir, {title, layout, distDir, urlPrefix, cache, data})
      ctx.type = 'html'
      ctx.body = html
    }

    await next()
  }
}
