module.exports = {
  // demo
  '/demo': {
    method: 'get',
    controller: ['demo.demo1', 'demo.demo2']
  },
  // 首页
  '/': 'home',
  // 关于我们
  '/about': 'about'
}
