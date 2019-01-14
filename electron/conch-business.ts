import {ConchDao} from "./const/conch-dao";
import {ConchFile} from "./service/conch-file";
import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmdirSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "fs";
import {EOL} from "os";
import {createInterface} from "readline";

import {TemplateBusiness} from "./const/template-business";
import {GenFileService} from "./const/gen-file.service";
import {Const} from "./const/const";

export class ConchBusiness {

    conchDao: any;
    conchFile: any;
    cheerio: any;

    templateBusiness: any;
    genFileService: any;
    const: Const;

    constructor() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');

        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }

    // ====================

    // 获取模型树
    async getModelTree(res) {

        let rootNode = {
            "title": '模型',
            "key": 'root',
            "expanded": true,
            "icon": "anticon anticon-folder",
            "children": []
        };

        let querySql = 'select * from ud_model';
        let modelList = await this.conchDao.queryTableAll(querySql);

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
            })
        }

        for (let key in typeMap) {
            rootNode.children.push(typeMap[key]);
        }

        res.send(JSON.stringify({
            status: "success",
            data: rootNode
        }));
    }

    // 保存模型
    async saveModel(modelObj, res) {
        let updateSql = `update ud_model set model_name = '${modelObj.model_name}',  model_data = '${modelObj.model_data}' where model_code = '${modelObj.model_code}';`;

        await this.conchDao.queryTableAll(updateSql);

        res.send(JSON.stringify({
            status: "success",
        }));
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
    scanLazyModule(projectObj: any, res) {
        let root_path = projectObj.root_path + '/src/app';
        let routing_path = root_path + '/app.routing.ts';

        let readStream = createReadStream(routing_path);

        let readLine = createInterface({
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

                let tmpStr: string = line;
                let moduleStr = tmpStr.split('#')[1].trim();
                if (moduleStr.indexOf('\'')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\''));
                } else if (moduleStr.indexOf('\"')) {
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
    scanModule(projectObj: any, res) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        let json_data = readFileSync(projectConchPath + '/s_moduleMap.json', {encoding: 'utf-8'});
        let moduleMap = JSON.parse(json_data);

        let treeMap = this.weaveModuleRecu(projectObj.module_name, moduleMap);

        res.send(JSON.stringify({
            status: "success",
            data: treeMap
        }));

    }

}