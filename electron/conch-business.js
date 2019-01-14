"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const conch_dao_1 = require("./const/conch-dao");
const conch_file_1 = require("./service/conch-file");
const fs_1 = require("fs");
const readline_1 = require("readline");
const template_business_1 = require("./const/template-business");
const gen_file_service_1 = require("./const/gen-file.service");
const const_1 = require("./const/const");
class ConchBusiness {
    constructor() {
        this.conchDao = new conch_dao_1.ConchDao();
        this.conchFile = new conch_file_1.ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new template_business_1.TemplateBusiness();
        this.genFileService = new gen_file_service_1.GenFileService();
        this.const = new const_1.Const();
    }
    // ====================
    // 获取模型树
    getModelTree(res) {
        return __awaiter(this, void 0, void 0, function* () {
            let rootNode = {
                "title": '模型',
                "key": 'root',
                "expanded": true,
                "icon": "anticon anticon-folder",
                "children": []
            };
            let querySql = 'select * from ud_model';
            let modelList = yield this.conchDao.queryTableAll(querySql);
            let typeMap = {};
            for (let i = 0; i < modelList.length; i++) {
                const modelObj = modelList[i];
                let typeObj = typeMap[modelObj.model_type];
                if (!typeObj) {
                    typeObj = {
                        "title": modelObj.model_type,
                        "key": modelObj.model_type,
                        "expanded": true,
                        "icon": "anticon anticon-folder",
                        "children": []
                    };
                    typeMap[modelObj.model_type] = typeObj;
                }
                typeObj.children.push({
                    "title": modelObj.model_name,
                    "key": modelObj.model_code,
                    "expanded": true,
                    "isLeaf": true,
                    "icon": "anticon anticon-file",
                    "children": [],
                    "model_name": modelObj.model_name,
                    "model_code": modelObj.model_code,
                    "model_type": modelObj.model_type,
                    "model_data": modelObj.model_data
                });
            }
            for (let key in typeMap) {
                rootNode.children.push(typeMap[key]);
            }
            res.send(JSON.stringify({
                status: "success",
                data: rootNode
            }));
        });
    }
    // 保存模型
    saveModel(modelObj, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let updateSql = `update ud_model set model_name = '${modelObj.model_name}',  model_data = '${modelObj.model_data}' where model_code = '${modelObj.model_code}';`;
            yield this.conchDao.queryTableAll(updateSql);
            res.send(JSON.stringify({
                status: "success",
            }));
        });
    }
    weaveModuleRecu(curModule, moduleMap) {
        let isLeaf = false;
        let icon = 'anticon anticon-folder';
        if (curModule.endsWith('Component')) {
            isLeaf = true;
            icon = 'anticon anticon-file';
        }
        let tmpNode = {
            "title": curModule,
            "key": curModule,
            "expanded": true,
            "isLeaf": isLeaf,
            "icon": icon,
            "children": []
        };
        let tmpModule = moduleMap[curModule];
        for (let key in tmpModule) {
            let subNode = this.weaveModuleRecu(key, moduleMap);
            tmpNode.children.push(subNode);
        }
        return tmpNode;
    }
    // 扫描懒加载模块
    scanLazyModule(projectObj, res) {
        let root_path = projectObj.root_path + '/src/app';
        let routing_path = root_path + '/app.routing.ts';
        let readStream = fs_1.createReadStream(routing_path);
        let readLine = readline_1.createInterface({
            input: readStream,
        });
        let curNodeFolder = {
            "title": 'root',
            "key": 'root',
            "expanded": true,
            "icon": "anticon anticon-folder",
            "children": []
        };
        readLine.on('line', (line) => {
            if (line.indexOf('loadChildren') != -1) {
                let tmpStr = line;
                let moduleStr = tmpStr.split('#')[1].trim();
                if (moduleStr.indexOf('\'')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\''));
                }
                else if (moduleStr.indexOf('\"')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\"'));
                }
                curNodeFolder.children.push({
                    "title": moduleStr,
                    "key": moduleStr,
                    "expanded": true,
                    "isLeaf": true,
                    "icon": "anticon anticon-file",
                    "children": [],
                });
            }
        });
        readLine.on('close', () => {
            res.send(JSON.stringify({
                status: "success",
                data: curNodeFolder
            }));
        });
        //==============
    }
    // 扫描模块
    scanModule(projectObj, res) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!fs_1.existsSync(projectConchPath)) {
            fs_1.mkdirSync(projectConchPath);
        }
        let json_data = fs_1.readFileSync(projectConchPath + '/s_moduleMap.json', { encoding: 'utf-8' });
        let moduleMap = JSON.parse(json_data);
        let treeMap = this.weaveModuleRecu(projectObj.module_name, moduleMap);
        res.send(JSON.stringify({
            status: "success",
            data: treeMap
        }));
    }
}
exports.ConchBusiness = ConchBusiness;
//# sourceMappingURL=conch-business.js.map