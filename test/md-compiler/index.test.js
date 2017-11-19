const pathJoin = require('path').join
const compiler = require('../../src/md-compiler')

const mdDir = pathJoin(__dirname, '../../src/docs')
const destDir = pathJoin(__dirname, '../../public/docs')
const imgBase = `/static/docs/`

console.log(mdDir, destDir, imgBase)

describe('markdown compiler', () => {
  it('public markdown html', (done) => {
    compiler(mdDir, {
      destDir,
      imgBase
    }).then(done)
  })
})
