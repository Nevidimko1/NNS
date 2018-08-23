const WrapperPlugin = require('wrapper-webpack-plugin');

const scriptConfig = require('./configs/scriptConfig')();

const config = require('./webpack.config');
config.mode = 'development';    // keep comments
config.plugins.push(
    new WrapperPlugin({
        test: /\.js$/, // only wrap output of bundle files with '.js' extension 
        header: scriptConfig,
        footer: ''
    })
);

module.exports = config;