const webpack = require('webpack');
const TSLintPlugin = require('tslint-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        publicPath: '',
        path: path.join(__dirname, '..', '/dist'),
        filename: 'nns.user.js'
    },
    externals: {
        jquery: '$'
    },
    resolve: {
        extensions: ['.js', '.ts']   
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    node: {
        path: 'empty'
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new TSLintPlugin({
            files: ['./src/**/*.ts']
        })
    ]
}