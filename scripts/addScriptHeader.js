const fs = require('fs');

const header = require('./scriptHeader.js')();
const filename = './dist/nns.user.js';

try {
    var data = fs.readFileSync(filename, 'utf-8');
    var newData = header + '\n' + data;
    fs.writeFileSync(filename, newData, 'utf-8');
    console.log(filename + ' has been prepended with script header');
} catch(e) {
    console.error('Failed to prepend ' + filename + ' with script header');
}