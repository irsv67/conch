import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "fs";

export class ServerMain {

    app: any;
    router: any;

    constructor() {

        let express = require('express');
        this.app = express();

        let bodyParser = require('body-parser');
        this.app.use(bodyParser.json());

        this.router = express.Router();
    }

    initRouter() {
        const that = this;

        // =====================================

        // 获取模型树
        this.router.post('/getModelTree', function (req, res) {
            console.log('Controller: ' + req.originalUrl);
            res.send(JSON.stringify({
                status: "success",
            }));

        });

        // save模型树
        this.router.post('/saveModel', function (req, res) {
            console.log('Controller: ' + req.originalUrl);
            res.send(JSON.stringify({
                status: "success",
            }));
        });

    }

    startServer() {

        this.initRouter();

        // 应用路由配置
        this.app.use('/express', this.router);

        let server = this.app.listen(3000, function () {
            let host = server.address().address;
            let port = server.address().port;
            console.log('conch-server listening at http://%s:%s', host, port);
            console.log('start success!');
        });

    }
}

let serverMain = new ServerMain();
serverMain.startServer();