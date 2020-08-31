/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { NODE_ENV = 'development' } = process.env;

module.exports = {
  mode: NODE_ENV,
  entry: ['./src/client/index.ts'],
  output: {
    path: path.resolve(__dirname, '../build/client'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js',
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/client/index.html',
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'src/client/assets/', to: 'assets' }] }),
    new webpack.DefinePlugin({
      PHYSICS_DEBUG: JSON.stringify(false),
    }),
  ],
};
