import {renderFile} from 'ejs';
import {existsSync, mkdirSync, readdirSync, statSync, writeFile} from 'fs';
import {Const} from './const';

/**
 * 类功能描述：根据模板生成代码
 */

export class GenFileService {
    tempName: any = 'temp_ng_6x'; // 模板名
    appName: any = 'conch2'; // 模块名

    const: Const;
    baseSrcDir: any = './resources/app/';
    baseDestDir: any = '';

    constructor() {
        this.const = new Const();

    }

    scanDirFunc(curSrcDir: string, curDestDir: string, curFolder: string) {

        const that = this;

        const dir = readdirSync(curSrcDir + curFolder);
        dir.forEach(function (item) {
            const curSrcFile = curSrcDir + curFolder + '/' + item;
            const tmpFile = statSync(curSrcFile);

            const curFolderDest = curFolder.split(that.tempName).join(that.appName);
            const itemDest = item.split(that.tempName).join(that.appName);
            const curDestFile = curDestDir + curFolderDest + '/' + itemDest;

            if (tmpFile.isDirectory() && !(item === '.git')) {
                if (!existsSync(curDestFile)) {
                    mkdirSync(curDestFile);
                }
                that.scanDirFunc(curSrcDir + curFolder + '/', curDestDir + curFolderDest + '/', item);
            } else if (tmpFile.isFile()) {
                if (!item.endsWith('.ico')) {
                    renderFile(curSrcFile, {appName: that.appName}, function (err: Error, str: string) {
                        writeFile(curDestFile, str, function (err) {
                        });
                        console.log('file generated: ' + curDestFile);
                    });
                }
            }
        });
    }

    createProjectFile(projectObj: any) {

        this.appName = projectObj.project_name;

        // 如果目标目录不存在，创建目标目录
        if (!existsSync(projectObj.root_path)) {
            mkdirSync(projectObj.root_path);
        }

        const index = projectObj.root_path.lastIndexOf('/');
        this.baseDestDir = projectObj.root_path.substring(0, index) + '/';

        this.scanDirFunc(this.const.resource_base + '/', this.baseDestDir, this.tempName);
    }

}
