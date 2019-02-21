const path = require('path');

module.exports = {
    entry: './electron/electron-main-build.ts',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    target: "electron-main"
};
