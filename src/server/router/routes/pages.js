/**
 * 路由 - 页面加载
 * 
 * Usage:
 * '/demo': {
 *    method: 'get',
 *    controller: ['demo.demo1', 'demo.demo2']
 *  }
 */

module.exports = {
  // 首页
  '/': 'home',

  // 系列
  '/series': 'series',

  // 归档  
  '/archive': 'archive',

  '/tags/:tag': 'articles.tag',

  // 文章
  '/articles/:article': 'articles.article',

  // 关于我们
  '/about': 'about'
}
