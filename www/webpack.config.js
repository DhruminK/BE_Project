const HtmlWebpack = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;

const thisDir = __dirname;
const rootDir = path.resolve(path.join(__dirname,'..'));

module.exports = {
  devtool: 'source-map',
  watch: true,
  entry : {
    app: [path.resolve(thisDir, 'app', 'main')],
    vendor: [path.resolve(thisDir, 'app', 'vendor')]
  },
  module: {
    loaders: [
      { loader: 'raw-loader', test: /\.(css|html)$/ },
      { exclude: /node_modules/, loader: 'ts-loader', test: /\.ts$/ }
    ]
  },
  output: {
    filename: '[name].bundle.min.js',
    path: path.resolve(rootDir, 'public', 'bundle')
  },

  plugins: [
    new ChunkWebpack({
      filename: 'vendor.bundle.min.js',
      name: 'vendor'
    })
  ],

  resolve: {
    extensions: [ '.js', '.ts']
  }
}