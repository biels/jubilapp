const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {parsed: localEnv} = require('dotenv').config()

const config = {
  output: {
    path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    // alias: {
    //   "react-entity-plane": path.resolve(__dirname, 'debug_modules/react-entity-plane'),
    //   "react-navigation-plane": path.resolve(__dirname, 'debug_modules/react-navigation-plane')
    // }
    modules: [path.resolve('node_modules'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              allowTsInNodeModules: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /\.(ttf|woff|eot)/,
        use: {
          loader: "file-loader",
          options: {
            name: '[path][name].[ext]',
            emitFile: true
          }
        }
      },
      {
        test: /\.(png|jpg)/,
        use: {
          loader: "file-loader",
          options: {
            name: '[name].[ext]',
            emitFile: true
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'src', 'index.html') }),
    new webpack.EnvironmentPlugin(localEnv)
  ]
}
module.exports = config
