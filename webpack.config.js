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
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-object-rest-spread'],
          presets: ['es2015', 'react', 'stage-2'],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
};
