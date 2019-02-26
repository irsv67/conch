import { ConchDao } from './const/conch-dao';
import { ConchFile } from './service/conch-file';
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { createInterface } from 'readline';
import { TemplateBusiness } from './const/template-business';
import { GenFileService } from './const/gen-file.service';
import { Const } from './const/const';
var ConchBusiness = /** @class */ (function () {
    function ConchBusiness() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }
    // ====================
    ConchBusiness.prototype.weaveModuleRecu = function (curModule, moduleMap) {
        var isLeaf = false;
        var icon = 'anticon anticon-folder';
        if (curModule.endsWith('Component')) {
            isLeaf = true;
            icon = 'anticon anticon-file';
        }
        var tmpNode = {
            'title': curModule,
            'key': curModule,
            'expanded': true,
            'isLeaf': isLeaf,
            'icon': icon,
            'children': []
        };
        var tmpModule = moduleMap[curModule];
        for (var key in tmpModule) {
            var subNode = this.weaveModuleRecu(key, moduleMap);
            tmpNode.children.push(subNode);
        }
        return tmpNode;
    };
    // 扫描懒加载模块
    ConchBusiness.prototype.scanLazyModule = function (projectObj, res) {
        var root_path = projectObj.root_path + '/src/app';
        var routing_path = root_path + '/app.routing.ts';
        var readStream = createReadStream(routing_path);
        var readLine = createInterface({
            input: readStream,
        });
        var curNodeFolder = {
            'title': 'root',
            'key': 'root',
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        };
        readLine.on('line', function (line) {
            if (line.indexOf('loadChildren') != -1) {
                var tmpStr = line;
                var moduleStr = tmpStr.split('#')[1].trim();
                if (moduleStr.indexOf('\'')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\''));
                }
                else if (moduleStr.indexOf('\"')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\"'));
                }
                curNodeFolder.children.push({
                    'title': moduleStr,
                    'key': moduleStr,
                    'expanded': true,
                    'isLeaf': true,
                    'icon': 'anticon anticon-file',
                    'children': [],
                });
            }
        });
        readLine.on('close', function () {
            res.send(JSON.stringify({
                status: 'success',
                data: curNodeFolder
            }));
        });
        // ==============
    };
    // 扫描模块
    ConchBusiness.prototype.scanModule = function (projectObj, res) {
        var projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }
        var json_data = readFileSync(projectConchPath + '/s_moduleMap.json', { encoding: 'utf-8' });
        var moduleMap = JSON.parse(json_data);
        var treeMap = this.weaveModuleRecu(projectObj.module_name, moduleMap);
        res.send(JSON.stringify({
            status: 'success',
            data: treeMap
        }));
    };
    return ConchBusiness;
}());
export { ConchBusiness };
//# sourceMappingURL=conch-business.js.map