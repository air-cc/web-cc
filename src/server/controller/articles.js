const md = require('../middlewares/render-md')

module.exports = {
  async tag (ctx) {
    const { page = 1, size = 30 } = ctx.query
    const {tag} = ctx.params
    const { total, count, data } = await md.info({ page, size, tag })

    await ctx.render('articles', {
      data: {
        articles: data,
        pageInfo: {
          page,
          total,
          size,
          count
        }
      }
    })
  },
  async article (ctx) {
    const article = ctx.params.article
    await ctx.markdown(article)
  }
}
