/**
 * 中间件 - markdown 文件渲染
 * 
 * TODO:
 * - markdown 文件的属性（分类/标签/创建时间）支持: 这里考虑在 docs 中使用 json 文件来描述
 * - 这里都是运行时到系统目录中查找文件，可优化
 */

// const assert = require('assert')
const promisify = require('util').promisify
const { readFile } = require('fs')
const readFileAsync = promisify(readFile)
const pathJoin = require('path').join

const md = (opts) => {
  const {template, distDir = ''} = opts

  md.info = async ({page, size, tag}) => {
    const infosStr = await readFileAsync(pathJoin(distDir, 'info.json'), 'utf8')
    const infos = JSON.parse(infosStr).filter((info) => {
      if (!tag) return true
      return info.properties.tag === tag
    })
    const count = infos.length
    const start = (page - 1) * size
    const data = infos.slice(start, start + size)

    return {
      page,
      size,
      total: Math.ceil(count / size),
      count,
      data
    }
  }

  return async (ctx, next) => {
    ctx.markdown = async (article, opts = {}) => {
      const dist = opts.distDir || distDir
      const articleHTML = await readFileAsync(pathJoin(dist, article, `${article}.html`), 'utf8')

      await ctx.render(template, {
        data: {
          article: articleHTML
        }
      })
    }

    await next()
  }
}

module.exports = md
