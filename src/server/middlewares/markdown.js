/**
 * 中间件 - markdown 文件渲染
 * 
 * TODO:
 * - markdown 文件的属性（分类/标签/创建时间）支持: 这里考虑在 docs 中使用 json 文件来描述
 * - 这里都是运行时到系统目录中查找文件，可优化
 */

// const assert = require('assert')
const pathJoin = require('path').join
const render = require('../../md-compiler').render

module.exports = async (opts) => {
  const {docs, template, imgBase = '', distDir = ''} = opts

  render.setOptions({
    imgBase
  })

  return async (ctx, next) => {
    ctx.markdown = async (article, opts = {distDir: distDir}) => {
      const articlePath = pathJoin(docs, article, `${article}.md`)
      const articleHTML = render(articlePath, opts)

      await ctx.render(template, {
        data: {
          article: articleHTML
        }
      })
    }

    await next()
  }
}
