const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { parsed: localEnv } = require('dotenv').config();

const config = merge(baseConfig, {
    mode: 'development',
    entry: {
        app: ['./src/index.tsx', 'webpack-hot-middleware/client'],
        vendor: ['react', 'react-dom'],
        // vendor2: ['@blueprintjs/core', '@blueprintjs/icons','apollo-client', 'react-apollo', 'styled-components', "styled-components-ts"],
        // grid: ['ag-grid', 'ag-grid-react']
    },
    output: {
        path: path.resolve(__dirname, 'dev-dist'),
        publicPath: '/',
        filename: '[name].dev-bundle.js',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                include: [__dirname+'/src', __dirname+'/../node_modules/react-entity-plane/lib'],
            },
        ],
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
    ],
});
module.exports = config;
