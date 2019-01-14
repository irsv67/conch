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
import {TemplateBusiness} from "./const/template-business";
import {GenFileService} from "./const/gen-file.service";
import {ConchDao} from "./const/conch-dao";
import {ConchFile} from "./service/conch-file";
import {Const} from "./const/const";

export class PageBusiness {

    conchDao: ConchDao;
    conchFile: ConchFile;
    cheerio: any;

    templateBusiness: TemplateBusiness;
    genFileService: GenFileService;
    const: Const;

    constructor() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');

        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();

    }

    removeBlock(blockObj) {

        let folder_path = this.const.home_path + '/ud_block';
        let file_path = folder_path + '/' + blockObj.block_code + '.json';
        unlinkSync(file_path);

    }

    createBlock(blockObj) {

        let block_code = 'block_' + this.genCodeFromTime();
        blockObj.block_code = block_code;

        if (!blockObj.block_name) {
            blockObj.block_name = blockObj.block_code
        }
        // =============================
        let folder_path = this.const.home_path + '/ud_block';
        if (!existsSync(folder_path)) {
            mkdirSync(folder_path);
        }
        let file_path = folder_path + '/' + block_code + '.json';

        // 写入文件
        writeFileSync(file_path, JSON.stringify(blockObj));

        // =============================

        return blockObj;
    }

    removePage(pageObj: any) {

        let pageName = pageObj.page_name;

        let folderPath = pageObj.base_app + pageObj.folder_path + '/' + pageName;

        let file_1 = '/' + pageName + '.component.html';
        let file_2 = '/' + pageName + '.component.css';
        let file_3 = '/' + pageName + '.component.ts';
        let file_4 = '/' + pageName + '.module.ts';
        let file_5 = '/' + pageName + '.service.ts';
        let file_6 = '/' + pageName + '.routing.ts';

        if (existsSync(folderPath + file_1)) {
            unlinkSync(folderPath + file_1);
        }
        if (existsSync(folderPath + file_2)) {
            unlinkSync(folderPath + file_2);
        }
        if (existsSync(folderPath + file_3)) {
            unlinkSync(folderPath + file_3);
        }
        if (existsSync(folderPath + file_4)) {
            unlinkSync(folderPath + file_4);
        }
        if (existsSync(folderPath + file_5)) {
            unlinkSync(folderPath + file_5);
        }
        if (existsSync(folderPath + file_6)) {
            unlinkSync(folderPath + file_6);
        }

        this.deleteFolder(folderPath);

        // 移除app.router代码
        let compUrl = pageObj.base_app + '/app.routing.ts';
        this.conchFile.removeItemScript(compUrl, pageName);

        // 移除menu代码
        let compUrl2 = pageObj.base_app + '/framework/menu-panel/menu-panel.component.ts';
        this.conchFile.removeItemScript(compUrl2, pageName);

        //=====================

        // 检测并读取文件
        let file_path = pageObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            projectSchema = JSON.parse(json_data);
        }

        let parentNode = this.getParentNodeRecu2(projectSchema, pageObj.page_code);

        let curIndex = -1;
        for (let i = 0; i < parentNode.children.length; i++) {
            const child = parentNode.children[i];
            if (child.key == pageObj.page_code) {
                curIndex = i;
            }
        }

        if (curIndex >= 0) {
            parentNode.children.splice(curIndex, 1);
        }

        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));

    }

    createPage(pageObj) {
        pageObj.folder_path = pageObj.folder_path || '';
        let pageName = pageObj.page_name;
        let pageNameUpper = '';
        let tmpArray = pageName.split('-');
        for (var i = 0; i < tmpArray.length; i++) {
            var obj = tmpArray[i];
            pageNameUpper += obj.charAt(0).toUpperCase() + obj.substring(1);
        }

        if (!existsSync(pageObj.base_app + pageObj.folder_path)) {
            mkdirSync(pageObj.base_app + pageObj.folder_path);
        }

        let dir_path = pageObj.base_app + pageObj.folder_path + '/' + pageName;
        if (!existsSync(dir_path)) {
            mkdirSync(dir_path);
        }

        let file_1 = '/' + pageName + '/' + pageName + '.component.html';
        let file_2 = '/' + pageName + '/' + pageName + '.component.css';
        let file_3 = '/' + pageName + '/' + pageName + '.component.ts';
        let file_4 = '/' + pageName + '/' + pageName + '.module.ts';
        let file_5 = '/' + pageName + '/' + pageName + '.service.ts';
        let file_6 = '/' + pageName + '/' + pageName + '.routing.ts';

        let str_1 = this.templateBusiness.getHtmlStr(pageName, pageNameUpper);
        let str_2 = this.templateBusiness.getStyleStr(pageName, pageNameUpper);
        let str_3 = this.templateBusiness.getCompStr(pageName, pageNameUpper);
        let str_4 = this.templateBusiness.getModuleStr(pageName, pageNameUpper);
        let str_5 = this.templateBusiness.getServiceStr(pageName, pageNameUpper);
        let str_6 = this.templateBusiness.getRoutingStr(pageName, pageNameUpper);

        writeFileSync(pageObj.base_app + pageObj.folder_path + file_1, str_1);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_2, str_2);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_3, str_3);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_4, str_4);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_5, str_5);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_6, str_6);

        // ===============================
        this.conchFile.weaveRouter(pageObj.base_app, pageObj.folder_path, pageName, pageNameUpper);
        this.conchFile.weaveMenu(pageObj.base_app, pageObj.folder_path, pageName, pageNameUpper, pageObj.page_desc);

        // ===============================

        let page_code = 'page_' + this.genCodeFromTime();
        pageObj.page_code = page_code;

        // =============更新project_schema================
        // 检测并读取文件
        let file_path = pageObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            projectSchema = JSON.parse(json_data);
        }

        let parentNode = this.getParentNodeRecu(projectSchema, pageObj.folder_code);

        parentNode.children.push({
            "title": pageName,
            "key": pageObj.page_code,
            "expanded": true,
            "isLeaf": true,
            "icon": "anticon anticon-file",
            "children": [],

            "url": `#/${pageName}/${pageName}`,
            "folder_path": pageObj.folder_path,

            "page_name": pageName,
            "page_code": pageObj.page_code,
            "page_desc": pageObj.page_desc
        });

        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));

        // ============更新page_schema=================

        // 检测并读取文件
        let file_path_2 = pageObj.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (existsSync(file_path_2)) {
            let json_data = readFileSync(file_path_2, {encoding: 'utf-8'});
            pageSchema = JSON.parse(json_data);
        }

        pageSchema[pageObj.page_code] = {
            "title": pageName,
            "key": "root-conch",
            "icon": "anticon anticon-file",
            "isLeaf": false,
            "expanded": true,
            "children": [],

            "style_config": {}
        };

        // 写入文件
        writeFileSync(file_path_2, JSON.stringify(pageSchema));

    };

    removeFolder(folderObj: any) {

        let folderPath = folderObj.base_app + folderObj.tmp_path;
        this.deleteFolder(folderPath);

        // 检测并读取文件
        let file_path = folderObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            projectSchema = JSON.parse(json_data);
        }

        let parentNode = this.getParentNodeRecu2(projectSchema, folderObj.folder_code);

        let curIndex = -1;
        for (let i = 0; i < parentNode.children.length; i++) {
            const child = parentNode.children[i];
            if (child.key == folderObj.folder_code) {
                curIndex = i;
            }
        }

        if (curIndex >= 0) {
            parentNode.children.splice(curIndex, 1);
        }

        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));

    }

    createFolder(folderObj: any) {
        folderObj.tmp_path = folderObj.tmp_path || '';
        let folderFullPath = folderObj.base_app + folderObj.tmp_path + '/' + folderObj.folder_name;

        if (!existsSync(folderFullPath)) {
            mkdirSync(folderFullPath);
        }

        let folder_code = 'folder_' + this.genCodeFromTime();
        folderObj.folder_code = folder_code;

        // =============================
        // 检测并读取文件
        let file_path = folderObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            projectSchema = JSON.parse(json_data);
        }

        let parentNode = this.getParentNodeRecu(projectSchema, folderObj.parent_code);

        parentNode.children.push({
            "title": folderObj.folder_name,
            "key": folderObj.folder_code,
            "expanded": true,
            "icon": "anticon anticon-folder",
            "children": []
        });

        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));

    }

    //====================

    private getParentNodeRecu2(curNode: any, cur_code: any) {
        let retValue;
        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const subNode = curNode.children[i];

                if (retValue) {
                    break;
                }
                if (subNode.key == cur_code) {
                    retValue = curNode;
                } else {
                    retValue = this.getParentNodeRecu2(subNode, cur_code);
                }

            }
        }
        return retValue;
    }

    private getParentNodeRecu(curNode: any, parent_code: any) {
        let retValue;
        if (curNode.key == parent_code) {
            retValue = curNode;
        } else if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const subNode = curNode.children[i];
                retValue = this.getParentNodeRecu(subNode, parent_code);
                if (retValue) {
                    break;
                }
            }
        }
        return retValue;
    }

    private deleteFolder(path) {
        const that = this;
        let files = [];
        if (existsSync(path)) {
            files = readdirSync(path);
            files.forEach(function (file, index) {
                let curPath = path + "/" + file;
                if (statSync(curPath).isDirectory()) { // recurse
                    that.deleteFolder(curPath);
                } else { // delete file
                    unlinkSync(curPath);
                }
            });
            rmdirSync(path);
        }
    }

    private genCodeFromTime() {
        let date = new Date();
        let code = '' + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds();
        return code;
    }

}