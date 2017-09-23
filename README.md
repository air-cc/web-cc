# Good-Web

前端静态网站开发脚手架。

## 目标

浏览器兼容：IE 9 可用

要做的事：
- 开发友好：项目结构清晰，权责明确（限制），模块调用与复用方便
- 调试友好：watch & reload
- 部署友好：docker 打包，一键部署
- 性能友好：前端性能经典优化方案落实
- SEO友好：配置基本 SEO 信息

不做的事：
- 直连数据库：所有动态数据通过后端服务接口提供
- 前后端代码同构：前后端 JS 代码异构，尽量不使用 Profill

后续推进：
- 测试脚本：后端标准测试流程
- SPA 支持：组件渲染与前端路由

## 技术选型

### 开发

- Node 8.x
- Koa 2.x
- Swig
- Less / PostCSS 

### 辅助

- 打包：gulp & webpack 打包资源
  基本目标：js/css/img 静态资源压缩；icon sprite 化；CDN 上传
- 开发辅助：watch 功能，eslint，

## 项目结构

```
- dest/
  - client/
  - server/
- src/
  - client/
    - lib/
      - jQuery.min.js
    - pages/
      - home/
        - home.html
        - home.js
        - home.css
        - components/
          - home-list/
        - assets/
          - home.png
    - components/
      - layout/
        - layout.html
        - layout.js
        - layout.css
        - assets/
      - header/
      - footer/
    - assets/
    - services/
      - user/
      - posts/
    - utils/
      - data-format.js
  - server/
    - router/
      - index.js
      - pages.js
      - apis.js
    - controller/
    - services/
    - app.js
- test/
```

## 开发说明

### 前端

以 component 为最小开发单位，以 page 为最小渲染单位

### 后端

- Router 路由：分为 pages 前端页面路由；apis 后端 ajax 接口路由
- Controller：路由下发后的业务处理
- Services：后端服务接口代理 proxy

### 其他

- 前端局部元素刷新问题：后端渲染 or 前端 jQuery 拼接？