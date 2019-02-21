import { renderFile } from 'ejs';
import { existsSync, mkdirSync, readdirSync, statSync, writeFile } from 'fs';
import { Const } from './const';
/**
 * 类功能描述：根据模板生成代码
 */
var GenFileService = /** @class */ (function () {
    function GenFileService() {
        this.tempName = 'temp_ng_6x'; // 模板名
        this.appName = 'conch2'; // 模块名
        this.baseSrcDir = './resources/app/';
        this.baseDestDir = '';
        this.const = new Const();
    }
    GenFileService.prototype.scanDirFunc = function (curSrcDir, curDestDir, curFolder) {
        var that = this;
        var dir = readdirSync(curSrcDir + curFolder);
        dir.forEach(function (item) {
            var curSrcFile = curSrcDir + curFolder + '/' + item;
            var tmpFile = statSync(curSrcFile);
            var curFolderDest = curFolder.split(that.tempName).join(that.appName);
            var itemDest = item.split(that.tempName).join(that.appName);
            var curDestFile = curDestDir + curFolderDest + '/' + itemDest;
            if (tmpFile.isDirectory() && !(item === '.git')) {
                if (!existsSync(curDestFile)) {
                    mkdirSync(curDestFile);
                }
                that.scanDirFunc(curSrcDir + curFolder + '/', curDestDir + curFolderDest + '/', item);
            }
            else if (tmpFile.isFile()) {
                if (!item.endsWith('.ico')) {
                    renderFile(curSrcFile, { appName: that.appName }, function (err, str) {
                        writeFile(curDestFile, str, function (err) {
                        });
                        console.log('file generated: ' + curDestFile);
                    });
                }
            }
        });
    };
    GenFileService.prototype.createProjectFile = function (projectObj) {
        this.appName = projectObj.project_name;
        // 如果目标目录不存在，创建目标目录
        if (!existsSync(projectObj.root_path)) {
            mkdirSync(projectObj.root_path);
        }
        var index = projectObj.root_path.lastIndexOf('/');
        this.baseDestDir = projectObj.root_path.substring(0, index) + '/';
        this.scanDirFunc(this.const.resource_base + '/', this.baseDestDir, this.tempName);
    };
    return GenFileService;
}());
export { GenFileService };
//# sourceMappingURL=gen-file.service.js.map