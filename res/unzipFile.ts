var fs = require("fs");
var unzip = require("unzip");

var args = process.argv.splice(2);

let from_path = 'K:/node_modules.zip';
let to_path = 'J:\\test\\test5';

console.log('==args==' + args.length);
if (args && args.length >= 2) {
    from_path = args[0];
    to_path = args[1];
}

console.log('==from_path==' + from_path);
console.log('==to_path==' + to_path);

//创建解压缩对象unzipFile
let unzip_extract = unzip.Extract({path: to_path});
//监听解压缩、传输数据过程中的错误回调
unzip_extract.on('error', (err) => {
    console.log('==unzip error==');
});
//监听解压缩、传输数据结束
unzip_extract.on('finish', () => {
    console.log('==unzip finish==');
});
//创建可读文件流，传输数据
fs.createReadStream(from_path).pipe(unzip_extract);
console.log('==unzip start==');
