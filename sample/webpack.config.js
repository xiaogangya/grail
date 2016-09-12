var webpack = require('webpack')

module.exports = {
  entry: {
    index: './src/index.js',
    plugin_counter: ['./src/components/Counter.js'],
    plugin_release: ['./src/components/Release.js']
  },
  output: {
    filename: '[name].js',
    path: './dist',
    publicPath: '/dist/'
  },
  // externals: {
  //   "react": "React",
  //   "react-bootstrap-table": "ReactBsTable",
  //   "react-notification-system": "NotificationSystem"
  // },
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