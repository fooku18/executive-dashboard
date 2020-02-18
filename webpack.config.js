const webpack = require('webpack');
const path = require('path');
const config = require("./config");
const FileIncludeWebpackPlugin = require("file-include-webpack-plugin");

module.exports = {
  entry: ['./src/index.ts', './dist/sw.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist', 'static', 'executive')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer:{
    contentBase: "./dist",
    publicPath: "/static/executive/"
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.GRAPH_FETCH_API_ENDPOINT': JSON.stringify(config[process.env.NODE_ENV].graph_endpoint),
      'process.env.ROOT_DIR': JSON.stringify(config[process.env.NODE_ENV].root_dir),
    }),
    new FileIncludeWebpackPlugin({
      source: './src/html',
      destination: '../../'
    })
  ]
};