const fs = require('fs');

const header = require('./scriptHeader')(true);
const webpackDevConfig = require('../configs/webpack.dev.config');

const content = header + `

let script = document.createElement("script");
script.src = 'http://localhost:${webpackDevConfig.devServer.port}/nns.user.js';
script.type = 'text/javascript';
document.documentElement.appendChild(script);
`;

console.log('Writing nns.dev.user.js script');
try {
    if (!fs.existsSync('./.tmp')){
        fs.mkdirSync('./.tmp');
    }

    fs.writeFileSync('./.tmp/nns.dev.user.js', content);
    console.log('Done');
} catch (e) {
    console.error("Cannot write file ", e);
}
