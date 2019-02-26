import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { TemplateBusiness } from './const/template-business';
import { GenFileService } from './const/gen-file.service';
import { ConchDao } from './const/conch-dao';
import { ConchFile } from './service/conch-file';
import { Const } from './const/const';
var StageBusiness = /** @class */ (function () {
    function StageBusiness() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }
    StageBusiness.prototype.queryBlockAll = function () {
        var folder_path = this.const.home_path + '/ud_block';
        if (!existsSync(folder_path)) {
            mkdirSync(folder_path);
        }
        var rows = this.conchDao.getDataListFromHome('ud_block');
        return rows;
    };
    StageBusiness.prototype.updatePageSchema = function (pageVO) {
        // ============更新page_schema=================
        // 检测并读取文件
        var file_path_2 = pageVO.root_path + '/_con_pro/page_schema.json';
        var pageSchema = {};
        if (existsSync(file_path_2)) {
            var json_data = readFileSync(file_path_2, { encoding: 'utf-8' });
            pageSchema = JSON.parse(json_data);
        }
        pageSchema[pageVO.page_code] = JSON.parse(pageVO.page_schema);
        // 写入文件
        writeFileSync(file_path_2, JSON.stringify(pageSchema));
        // =============================================
        var fileMap = {};
        this.getFileCompRecu(pageSchema[pageVO.page_code], fileMap);
        var sub_path = '/' + pageVO.page_name;
        var baseDestDir = pageVO.base_app + pageVO.folder_path + sub_path;
        for (var fileCompName in fileMap) {
            var baseSrcDir = this.const.resource_base + '/temp_comp/' + fileCompName;
            var finalDescDir = baseDestDir + '/' + fileCompName;
            if (!existsSync(finalDescDir)) {
                mkdirSync(finalDescDir);
            }
            this.genFileService.scanDirFunc(baseSrcDir, finalDescDir, '');
        }
        this.conchFile.weaveModule(pageVO, fileMap);
        // =============================================
        var compMap = this.conchDao.getCompMap();
        // =============================================
        var pageSchemaObj = JSON.parse(pageVO.page_schema);
        var outerObj = {
            indexCountMap: {},
            keyIndexMap: {}
        };
        this.walkSchemaForIndexRecu(pageSchemaObj, outerObj);
        // =============================================
        this.conchFile.weaveHtmlAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveScriptAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveStyleAll(pageVO, compMap, outerObj.keyIndexMap);
        // =============================================
    };
    StageBusiness.prototype.walkSchemaForIndexRecu = function (curNode, outerObj) {
        if (curNode.comp_code) {
            if (outerObj.indexCountMap[curNode.comp_code] == null) {
                outerObj.indexCountMap[curNode.comp_code] = 0;
                outerObj.keyIndexMap[curNode.key] = 0;
            }
            else {
                var curIndex = outerObj.indexCountMap[curNode.comp_code];
                outerObj.indexCountMap[curNode.comp_code] = curIndex + 1;
                outerObj.keyIndexMap[curNode.key] = curIndex + 1;
            }
        }
        if (curNode.children) {
            for (var i = 0; i < curNode.children.length; i++) {
                var child = curNode.children[i];
                this.walkSchemaForIndexRecu(child, outerObj);
            }
        }
    };
    StageBusiness.prototype.queryDemoDataAll = function () {
        var demoDataMap = {};
        var tmpPath = this.const.resource_base + '/data_demo';
        var dir = readdirSync(tmpPath);
        dir.forEach(function (item) {
            var filePath = tmpPath + '/' + item;
            var fileObj = {};
            if (existsSync(filePath)) {
                var json_data = readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                demoDataMap[item.split('.')[0]] = fileObj;
            }
        });
        return demoDataMap;
    };
    StageBusiness.prototype.queryModelAll = function () {
        var modelList = this.conchDao.getDataJsonByName('ud_model');
        return modelList;
    };
    StageBusiness.prototype.queryCompAll = function () {
        var compList = this.conchDao.getDataJsonByName('ud_comp');
        return compList;
    };
    // =====================================
    StageBusiness.prototype.getFileCompRecu = function (treeNode, fileMap) {
        if (treeNode.comp_code == 'BaseInfo') {
            var tmpName = 'base-info';
            fileMap[tmpName] = 1;
        }
        if (treeNode.comp_code == 'Line') {
            var tmpName = 'chart';
            fileMap[tmpName] = 1;
        }
        if (treeNode.children && treeNode.children.length > 0) {
            for (var i = 0; i < treeNode.children.length; i++) {
                var childNode = treeNode.children[i];
                this.getFileCompRecu(childNode, fileMap);
            }
        }
    };
    return StageBusiness;
}());
export { StageBusiness };
//# sourceMappingURL=stage-business.js.map