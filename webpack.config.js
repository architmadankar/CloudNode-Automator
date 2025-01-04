const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './app.js', 
  target: 'node', 
  externals: [nodeExternals()], 
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', 
  },
  mode: 'production', // Set to production for optimizations
  optimization: {
    minimize: true, 
  },
};
