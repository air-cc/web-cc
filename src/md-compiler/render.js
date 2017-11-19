const promisify = require('util').promisify
const { readFile } = require('fs')
const readFileAsync = promisify(readFile)
// const resolveUrl = require('url').resolve
const pathJoin = require('path').join
const marked = require('marked')

class Renderer extends marked.Renderer {
  constructor (opts = {}) {
    super()
    this.opts = opts
  }

  // 图片路径问题的 PR 尚未合进 master
  image (href, title, text) {
    const imgBase = this.opts.imgBase
    if (typeof imgBase === 'string') {
      href = pathJoin(imgBase, href)
    }

    return super.image(href, title, text)
  }
}

const render = async (articlePath, opts) => {
  const content = await readFileAsync(articlePath, 'utf8')
  return marked(content, {
    renderer: new Renderer({
      imgBase: opts.imgBase
    })
  })
}

module.exports = render
