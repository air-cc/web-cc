exports.demo1 = (ctx, next) => {
  ctx.des = 'demo'
  return next()
}

exports.demo2 = (ctx) => {
  ctx.body = {
    page: 'demo',
    des: ctx.des
  }
}
