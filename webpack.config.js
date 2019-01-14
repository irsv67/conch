const path = require('path');

module.exports = {
    entry: './electron-main-build.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    // node: {
    //     fs: "empty",
    //     net: "empty",
    //     readline: "empty",
    //     tls: "empty"
    // },
    target: "electron-main"

};
