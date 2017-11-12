module.exports = async (ctx) => {
  await ctx.render('home', {
    data: { page: 'home-cc', msg: 'hello world' }
  })
}
