var webpack = require('webpack')

module.exports = {
  entry: {
    index: './src/index.js',
    component: ['./src/components/Main.js']
  },
  output: {
    filename: '[name].js',
    path: './dist',
    publicPath: '/dist/'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'react-hot!babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader',
        exclude: /node_modules/
      }
    ]
  },
  babel: {
    presets: [
      "es2015",
      "react"
    ],
    plugins: ['transform-runtime']
  },
  port: 8080,
  devServer: {
    contentBase: './src'
  },
  externals: {
    'react': 'react'
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
} else {
  module.exports.devtool = '#source-map'
}