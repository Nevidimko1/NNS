const fs = require('fs');
const scriptConfig = require('./scriptConfig')(true);

const content = scriptConfig + `

let script = document.createElement("script");
script.src = 'http://localhost:8080/nns.user.js';
script.type = 'text/javascript';
document.documentElement.appendChild(script);
`;

console.log('Writing nns.dev.user.js script');
try {
    fs.writeFileSync('./dist/nns.dev.user.js', content);
    console.log('Done');
} catch (e) {
    console.error("Cannot write file ", e);
}
