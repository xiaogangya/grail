var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: {
    index: './src/index.js',
    Counter: ['./src/components/Counter.js'],
    BranchMerger: ['./src/components/BranchMerger.js'],
    ConfigMerger: ['./src/components/ConfigMerger.js']
  },
  output: {
    filename: '[name].js',
    path: './dist',
    publicPath: '/dist/'
  },
  externals: {
    "react": "React"
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
    plugins: [
      'transform-runtime'
    ]
  },
  port: 8080,
  devServer: {
    contentBase: './src'
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