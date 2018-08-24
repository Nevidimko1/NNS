const path = require('path');

const config = require('./webpack.config');

config.mode = 'development';
config.devtool = 'inline-source-map';
config.devServer = {
    contentBase: path.join(__dirname, '.tmp'),
    port: 3000,
    inline: false
}

module.exports = config;