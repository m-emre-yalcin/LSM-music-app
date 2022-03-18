const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('A', resolve('./src/assets'))

    const svgRule = config.module.rule('svg')

    svgRule.uses.clear()

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  },
  css: {
    sourceMap: true,
    loaderOptions: {
      scss: {
        prependData: "@import './src/assets/style/main.scss';"
      }
    }
  }
}
