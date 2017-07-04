const path = require('path');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    eventPage: './src/eventPage.js',
    contentScript: './src/contentScript.jsx',
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: '[name].bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};
