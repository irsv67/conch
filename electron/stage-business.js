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
const fs_1 = require("fs");
const template_business_1 = require("./const/template-business");
const gen_file_service_1 = require("./const/gen-file.service");
const conch_dao_1 = require("./const/conch-dao");
const conch_file_1 = require("./service/conch-file");
const const_1 = require("./const/const");
class StageBusiness {
    constructor() {
        this.conchDao = new conch_dao_1.ConchDao();
        this.conchFile = new conch_file_1.ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new template_business_1.TemplateBusiness();
        this.genFileService = new gen_file_service_1.GenFileService();
        this.const = new const_1.Const();
    }
    queryBlockAll() {
        let folder_path = this.const.home_path + '/ud_block';
        if (!fs_1.existsSync(folder_path)) {
            fs_1.mkdirSync(folder_path);
        }
        let rows = this.conchDao.getDataListFromHome('ud_block');
        return rows;
    }
    ;
    updatePageSchema(pageVO) {
        // ============更新page_schema=================
        // 检测并读取文件
        let file_path_2 = pageVO.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (fs_1.existsSync(file_path_2)) {
            let json_data = fs_1.readFileSync(file_path_2, { encoding: 'utf-8' });
            pageSchema = JSON.parse(json_data);
        }
        pageSchema[pageVO.page_code] = JSON.parse(pageVO.page_schema);
        // 写入文件
        fs_1.writeFileSync(file_path_2, JSON.stringify(pageSchema));
        // =============================================
        let fileMap = {};
        this.getFileCompRecu(pageSchema[pageVO.page_code], fileMap);
        let sub_path = '/' + pageVO.page_name;
        let baseDestDir = pageVO.base_app + pageVO.folder_path + sub_path;
        for (let fileCompName in fileMap) {
            let baseSrcDir = this.const.resource_base + '/temp_comp/' + fileCompName;
            let finalDescDir = baseDestDir + '/' + fileCompName;
            if (!fs_1.existsSync(finalDescDir)) {
                fs_1.mkdirSync(finalDescDir);
            }
            this.genFileService.scanDirFunc(baseSrcDir, finalDescDir, '');
        }
        this.conchFile.weaveModule(pageVO, fileMap);
        // =============================================
        let compMap = this.conchDao.getCompMap();
        // =============================================
        let pageSchemaObj = JSON.parse(pageVO.page_schema);
        let outerObj = {
            indexCountMap: {},
            keyIndexMap: {}
        };
        this.walkSchemaForIndexRecu(pageSchemaObj, outerObj);
        // =============================================
        this.conchFile.weaveHtmlAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveScriptAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveStyleAll(pageVO, compMap, outerObj.keyIndexMap);
        // =============================================
    }
    walkSchemaForIndexRecu(curNode, outerObj) {
        if (curNode.comp_code) {
            if (outerObj.indexCountMap[curNode.comp_code] == null) {
                outerObj.indexCountMap[curNode.comp_code] = 0;
                outerObj.keyIndexMap[curNode.key] = 0;
            }
            else {
                let curIndex = outerObj.indexCountMap[curNode.comp_code];
                outerObj.indexCountMap[curNode.comp_code] = curIndex + 1;
                outerObj.keyIndexMap[curNode.key] = curIndex + 1;
            }
        }
        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const child = curNode.children[i];
                this.walkSchemaForIndexRecu(child, outerObj);
            }
        }
    }
    queryDemoDataAll() {
        let demoDataMap = {};
        let tmpPath = this.const.resource_base + '/data_demo';
        let dir = fs_1.readdirSync(tmpPath);
        dir.forEach(function (item) {
            let filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (fs_1.existsSync(filePath)) {
                let json_data = fs_1.readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                demoDataMap[item.split('.')[0]] = fileObj;
            }
        });
        return demoDataMap;
    }
    queryModelAll() {
        let modelList = this.conchDao.getDataJsonByName('ud_model');
        return modelList;
    }
    queryCompAll() {
        let compList = this.conchDao.getDataJsonByName('ud_comp');
        return compList;
    }
    ;
    //=====================================
    getFileCompRecu(treeNode, fileMap) {
        if (treeNode.comp_code == 'BaseInfo') {
            let tmpName = 'base-info';
            fileMap[tmpName] = 1;
        }
        if (treeNode.comp_code == 'Line') {
            let tmpName = 'chart';
            fileMap[tmpName] = 1;
        }
        if (treeNode.children && treeNode.children.length > 0) {
            for (let i = 0; i < treeNode.children.length; i++) {
                const childNode = treeNode.children[i];
                this.getFileCompRecu(childNode, fileMap);
            }
        }
    }
    //=====================================
    syncTable(paramObj) {
        let table_name = paramObj.table_name;
        let comp_code = paramObj.comp_code;
        if (table_name == 'ud_comp') {
            this.syncCompTable(comp_code);
        }
        else {
            this.syncModelTable();
        }
    }
    syncCompTable(comp_code) {
        return __awaiter(this, void 0, void 0, function* () {
            let codeMap = {
                'BaseInfo': 1,
            };
            let file_base = this.const.resource_base + '/data_table/ud_comp';
            let querySql = 'select * from ud_comp';
            let compList = yield this.conchDao.queryTableAll(querySql);
            for (let i = 0; i < compList.length; i++) {
                const compObj = compList[i];
                //            if (!codeMap[compObj.comp_code]) {
                //                continue;
                //            }
                let file_path = file_base + '/' + compObj.comp_code + '.json';
                fs_1.writeFileSync(file_path, JSON.stringify(compObj));
            }
        });
    }
    syncModelTable() {
        return __awaiter(this, void 0, void 0, function* () {
            let file_base = this.const.resource_base + '/data_table/ud_model';
            let querySql = 'select * from ud_model';
            let compList = yield this.conchDao.queryTableAll(querySql);
            for (let i = 0; i < compList.length; i++) {
                const compObj = compList[i];
                let file_path = file_base + '/' + compObj.model_code + '.json';
                fs_1.writeFileSync(file_path, JSON.stringify(compObj));
            }
        });
    }
}
exports.StageBusiness = StageBusiness;
//# sourceMappingURL=stage-business.js.map