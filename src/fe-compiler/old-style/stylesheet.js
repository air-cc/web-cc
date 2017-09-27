// css 样式表编译

const promisify = require('util').promisify
const webpack = require('webpack')
const webpackAsync = promisify(webpack)
const CleanWebpackPlugin = require('clean-webpack-plugin')
var Ex = require('extract-text-webpack-plugin')
const wrapper = require('./assetsCompiler').wrapper

// 原始样式编译
const styleCompile = async ({name, assets, workingDir}) => {
  const webpackConfig = {
    entry: assets,
    output: {
      filename: `${name}.[hash:8].css-js`,
      path: workingDir
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: Ex.extract({
            fallback: 'style-loader',
            use: 'css-loader',
            publicPath: workingDir
          })
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin([`${name}.*.css`, `${name}.*.css-js`], {
        root: workingDir,
        verbose: true
      }),
      new Ex(`${name}.[hash:8].css`)
    ]
  }

  const stat = await webpackAsync(webpackConfig)

  return `${name}.${stat.hash.slice(0, 8)}.css`
}

// compiler
const compiler = wrapper({
  type: 'css',
  compile: styleCompile
})

module.exports = compiler
