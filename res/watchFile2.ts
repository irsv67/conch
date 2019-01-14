import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmdirSync,
    stat,
    statSync,
    unlinkSync,
    watch,
    writeFileSync
} from 'fs';

let fileName = 'J:\\test\\demo-pro-3\\src';
const spawn = require('child_process').spawn;

let timeoutHandler;

watch(fileName, function (a, b) {
    console.log("====" + a + "====" + b + "====");

    if (timeoutHandler) {
        clearTimeout(timeoutHandler);
    }
    //防止点击节点右边output点 出现指向自己的线
    timeoutHandler = setTimeout(function () {
        let data = `
            J:
            cd J:/test/demo-pro-3
            npm run build`;

        writeFileSync('ccc.bat', data);

        const server = spawn('ccc.bat', [], {});

        server.stdout.on('data', (data) => {
            let dataStr = data.toString();
            console.log(dataStr);
        });

        server.stderr.on('data', (data) => {
            let dataStr = data.toString();
            console.log(`stderr: ${dataStr}`);
        });

    }, 1000);

});
console.log("watching file...");