// js 脚本编译
const promisify = require('util').promisify
const webpack = require('webpack')
const webpackAsync = promisify(webpack)
const CleanWebpackPlugin = require('clean-webpack-plugin')
const wrapper = require('./assetsCompiler').wrapper

// 原始脚本编译
const scriptCompile = async ({name, assets, workingDir}) => {
  const webpackConfig = {
    entry: assets,
    output: {
      filename: `${name}.[hash:8].js`,
      path: workingDir
    },
    plugins: [
      new CleanWebpackPlugin([`${name}.*.js`], {
        root: workingDir,
        verbose: true
      })
      // new webpack.optimize.CommonsChunkPlugin({
      //   minChunks: Infinity
      // })
    ],
    externals: {
      jquery: 'jQuery'
    }
  }

  const stat = await webpackAsync(webpackConfig)

  return `${name}.${stat.hash.slice(0, 8)}.js`
}

// compiler
const compiler = wrapper({
  type: 'js',
  compile: scriptCompile
})

module.exports = compiler
