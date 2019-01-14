"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = require("ejs");
const fs_1 = require("fs");
const const_1 = require("./const");
/**
 * 类功能描述：根据模板生成代码
 */
class GenFileService {
    constructor() {
        this.tempName = "temp_ng_6x"; //模板名
        this.appName = "conch2"; //模块名
        this.baseSrcDir = "./resources/app/";
        this.baseDestDir = "";
        this.const = new const_1.Const();
    }
    scanDirFunc(curSrcDir, curDestDir, curFolder) {
        const that = this;
        let dir = fs_1.readdirSync(curSrcDir + curFolder);
        dir.forEach(function (item) {
            let curSrcFile = curSrcDir + curFolder + "/" + item;
            let tmpFile = fs_1.statSync(curSrcFile);
            let curFolderDest = curFolder.split(that.tempName).join(that.appName);
            let itemDest = item.split(that.tempName).join(that.appName);
            let curDestFile = curDestDir + curFolderDest + "/" + itemDest;
            if (tmpFile.isDirectory() && !(item == '.git')) {
                if (!fs_1.existsSync(curDestFile)) {
                    fs_1.mkdirSync(curDestFile);
                }
                that.scanDirFunc(curSrcDir + curFolder + "/", curDestDir + curFolderDest + "/", item);
            }
            else if (tmpFile.isFile()) {
                if (!item.endsWith(".ico")) {
                    ejs_1.renderFile(curSrcFile, { appName: that.appName }, function (err, str) {
                        fs_1.writeFile(curDestFile, str, function (err) {
                        });
                        console.log("file generated: " + curDestFile);
                    });
                }
            }
        });
    }
    ;
    createProjectFile(projectObj) {
        this.appName = projectObj.project_name;
        //如果目标目录不存在，创建目标目录
        if (!fs_1.existsSync(projectObj.root_path)) {
            fs_1.mkdirSync(projectObj.root_path);
        }
        let index = projectObj.root_path.lastIndexOf('/');
        this.baseDestDir = projectObj.root_path.substring(0, index) + '/';
        this.scanDirFunc(this.const.resource_base + '/', this.baseDestDir, this.tempName);
    }
}
exports.GenFileService = GenFileService;
//# sourceMappingURL=gen-file.service.js.map