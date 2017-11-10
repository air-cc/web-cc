const pathJoin = require('path').join
const promisify = require('util').promisify
const {readFile, writeFile} = require('fs')
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)
const webpack = require('webpack')
const webpackAsync = promisify(webpack)
const CleanWebpackPlugin = require('clean-webpack-plugin')
const Ex = require('extract-text-webpack-plugin')

const CWD = process.cwd()

const updatePublicMap = async ({chunks}, assetsList, filePath) => {
  let dataStr = ''
  try {
    dataStr = await readFileAsync(filePath, 'utf8')
  } catch (e) {
    console.log(`sources map file not found: ${filePath} - that's ok!`)
  }

  const publicMap = dataStr ? JSON.parse(dataStr) : {}

  chunks.map(({modules}) => {
    modules.forEach(({id, name, assets}) => {
      const file = pathJoin(CWD, name)
      if (~assetsList.indexOf(file) && assets && assets.length) {
        console.log(file, assets[0])
        publicMap[file] = assets[0]
      }
    })
  })

  await writeFileAsync(filePath, JSON.stringify(publicMap, null, 2))

  return publicMap
}

const getWebpackConfig = ({name, entries, context, distDir, urlPrefix = ''}) => {
  const entry = {}
  entry[name] = entries

  const webpackConfig = {
    // 执行目录
    context,

    // 源文件
    entry,

    // 目标文件
    output: {
      filename: '[name].[hash:8].js',
      path: distDir,
      publicPath: urlPrefix // 导出目录 - 可动态修改文件导出的 url
    },

    // 加载处理模块
    module: {
      rules: [
        {
          test: /\.html$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash:8].[ext]'
              }
            },
            {
              loader: 'extract-loader'
            },
            {
              loader: 'html-loader',
              options: {
                attrs: ['img:src', 'link:href'],
                interpolate: true
              }
            }
          ]
        },
        {
          test: /\.css$/i,
          use: Ex.extract({
            fallback: 'style-loader',
            use: 'css-loader'
          })
          // loaders: [
          //   {
          //     loader: 'file-loader',
          //     options: {
          //       name: '[name].[hash:8].[ext]'
          //     }
          //   },
          //   {
          //     loader: 'extract-loader'
          //   },
          //   {
          //     loader: 'css-loader'
          //   }
          // ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },

    // 插件
    plugins: [
      new CleanWebpackPlugin(['*'], {
        root: distDir,
        verbose: true
      }),
      new Ex('[name].[hash:5].css')
      // new webpack.ProvidePlugin({
      //   'jQuery': path.resolve(
      //     __dirname,
      //     'assets/bower_components/jquery/dist/jquery'
      //   ),
      //   '$': path.resolve(
      //     __dirname,
      //     'assets/bower_components/jquery/dist/jquery'
      //   )
      // })
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: ['jquery'],
      //   minChunks: Infinity
      // })
    ],

    externals: {
      jquery: 'jQuery'
    }
  }

  return webpackConfig
}

const webpackCompile = async (opts) => {
  const webpackConfig = getWebpackConfig(opts)

  const stats = await webpackAsync(webpackConfig)

  return stats
}

// assets search
const retrieve = (type, component) => {
  const searching = (component) => {
    const deps = component.deps
    let asset = component[type]

    let assets = new Set()

    if (!asset) return assets

    if (!Array.isArray(asset)) {
      asset = [asset]
    }

    if (asset.length === 0) return assets

    if (deps.length) {
      assets = deps.map(searching).reduce((items, scriptDeps) => {
        scriptDeps.forEach(items.add, items)
        return items
      }, assets)
    }

    asset.forEach(assets.add, assets)

    return assets
  }

  return searching(component)
}

const compiler = async ({component, distDir, urlPrefix = ''}) => {
  const assets = ['js', 'css', 'html']
    .map((type) => retrieve(type, component))
    .reduce((items, subItmes) => items.concat([...subItmes]), [])

  const stats = await webpackCompile({
    name: component.name,
    context: component.dir,
    entries: assets,
    distDir: distDir,
    urlPrefix: urlPrefix
  })

  const publicMap = await updatePublicMap(stats.toJson(), assets, pathJoin(distDir, 'resources-map.json'))

  return {stats, publicMap}
}

module.exports = compiler

// ////////////////////////////// - 以下内容为其他辅助方法，不必要 - //////////////////////////////// //

const wrapper = ({compile, type}) => {
  return async ({component, distDir, urlPrefix = ''}) => {
    const assetsSet = retrieve(type, component)
    const assets = [...assetsSet]

    const workingDir = pathJoin(distDir, type)
    const filename = await compile({
      name: component.name,
      assets,
      workingDir
    })
    const filePath = pathJoin(urlPrefix, type, filename)

    return [filePath]
  }
}
compiler.wrapper = wrapper

const retrieveCompiler = async ({component, distDir, urlPrefix = ''}) => {
  const {name, js, html, css, deps} = component

  const distPath = pathJoin(distDir, name)
  if (deps.length) {
    await Promise.all(deps.map((dep) => retrieveCompiler({
      component: dep,
      distDir: distPath,
      urlPrefix: pathJoin(urlPrefix, name)
    })))
  }

  await webpackCompile({
    name,
    context: component.dir,
    entries: [js, html, css],
    path: distPath,
    publicPath: urlPrefix
  })
}
compiler.retrieveCompiler = retrieveCompiler
