/**
 * 中间件 - markdown 文件渲染
 * 
 * TODO:
 * - markdown 文件的属性（分类/标签/创建时间）支持: 这里考虑在 docs 中使用 json 文件来描述
 * - 这里都是运行时到系统目录中查找文件，可优化
 */

// const assert = require('assert')
const promisify = require('util').promisify
const pathJoin = require('path').join
const {readFile} = require('fs')
const readFileAsync = promisify(readFile)
const marked = require('marked')

module.exports = (opts) => {
  const {docs, template} = opts

  return async (ctx, next) => {
    ctx.markdown = async (article, opts) => {
      const articlePath = pathJoin(docs, `${article}.md`)
      const content = await readFileAsync(articlePath, 'utf8')
      const articleHTML = marked(content)

      await ctx.render(template, {
        data: {
          article: articleHTML
        }
      })
    }

    await next()
  }
}
