import {ConchDao} from './const/conch-dao';
import {ConchFile} from './service/conch-file';
import {createReadStream, existsSync, mkdirSync, readFileSync} from 'fs';
import {createInterface} from 'readline';

import {TemplateBusiness} from './const/template-business';
import {GenFileService} from './const/gen-file.service';
import {Const} from './const/const';

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

        const rootNode = {
            'title': '模型',
            'key': 'root',
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        };

        const querySql = 'select * from ud_model';
        const modelList = await this.conchDao.queryTableAll(querySql);

        const typeMap = {};
        for (let i = 0; i < modelList.length; i++) {
            const modelObj = modelList[i];

            let typeObj = typeMap[modelObj.model_type];
            if (!typeObj) {
                typeObj = {
                    'title': modelObj.model_type,
                    'key': modelObj.model_type,
                    'expanded': true,
                    'icon': 'anticon anticon-folder',
                    'children': []
                };
                typeMap[modelObj.model_type] = typeObj;
            }
            typeObj.children.push({
                'title': modelObj.model_name,
                'key': modelObj.model_code,
                'expanded': true,
                'isLeaf': true,
                'icon': 'anticon anticon-file',
                'children': [],

                'model_name': modelObj.model_name,
                'model_code': modelObj.model_code,
                'model_type': modelObj.model_type,
                'model_data': modelObj.model_data
            });
        }

        for (const key in typeMap) {
            rootNode.children.push(typeMap[key]);
        }

        res.send(JSON.stringify({
            status: 'success',
            data: rootNode
        }));
    }

    // 保存模型
    async saveModel(modelObj, res) {
        const updateSql = `update ud_model set model_name = '${modelObj.model_name}',  model_data = '${modelObj.model_data}' where model_code = '${modelObj.model_code}';`;

        await this.conchDao.queryTableAll(updateSql);

        res.send(JSON.stringify({
            status: 'success',
        }));
    }

    weaveModuleRecu(curModule, moduleMap) {

        let isLeaf = false;
        let icon = 'anticon anticon-folder';
        if (curModule.endsWith('Component')) {
            isLeaf = true;
            icon = 'anticon anticon-file';
        }

        const tmpNode = {
            'title': curModule,
            'key': curModule,
            'expanded': true,
            'isLeaf': isLeaf,
            'icon': icon,
            'children': []
        };

        const tmpModule = moduleMap[curModule];
        for (const key in tmpModule) {
            const subNode = this.weaveModuleRecu(key, moduleMap);
            tmpNode.children.push(subNode);
        }

        return tmpNode;
    }

    // 扫描懒加载模块
    scanLazyModule(projectObj: any, res) {
        const root_path = projectObj.root_path + '/src/app';
        const routing_path = root_path + '/app.routing.ts';

        const readStream = createReadStream(routing_path);

        const readLine = createInterface({
            input: readStream,
        });

        const curNodeFolder = {
            'title': 'root',
            'key': 'root',
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        };

        readLine.on('line', (line) => {

            if (line.indexOf('loadChildren') != -1) {

                const tmpStr: string = line;
                let moduleStr = tmpStr.split('#')[1].trim();
                if (moduleStr.indexOf('\'')) {
                    moduleStr = moduleStr.substring(0, moduleStr.indexOf('\''));
                } else if (moduleStr.indexOf('\"')) {
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

        readLine.on('close', () => {
            res.send(JSON.stringify({
                status: 'success',
                data: curNodeFolder
            }));
        });

        // ==============

    }

    // 扫描模块
    scanModule(projectObj: any, res) {
        const projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        const json_data = readFileSync(projectConchPath + '/s_moduleMap.json', {encoding: 'utf-8'});
        const moduleMap = JSON.parse(json_data);

        const treeMap = this.weaveModuleRecu(projectObj.module_name, moduleMap);

        res.send(JSON.stringify({
            status: 'success',
            data: treeMap
        }));

    }

}
