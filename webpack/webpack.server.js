/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const { NODE_ENV = 'development' } = process.env;

module.exports = {
  entry: './server/server.ts',
  mode: NODE_ENV,
  target: 'node',

  output: {
    path: path.resolve(__dirname, '../build/server'),
    filename: 'server.js',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },

  externals: [nodeExternals()],

  plugins: [
    new webpack.DefinePlugin({
      PHYSICS_DEBUG: JSON.stringify(false),
    }),
  ],
};
