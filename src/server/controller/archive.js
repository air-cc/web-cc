const md = require('../middlewares/markdown')

module.exports = async (ctx) => {
  const {page = 1, size = 30} = ctx.query
  const {total, count, data} = await md.info({page, size})

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
}
