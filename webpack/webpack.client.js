/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: ['./client/index.ts'],
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
      template: 'client/index.html',
    }),
    new CopyWebpackPlugin({ patterns: [{ from: 'client/assets/', to: 'assets' }] }),
    new webpack.DefinePlugin({
      PHYSICS_DEBUG: JSON.stringify(false),
    }),
  ],
};
