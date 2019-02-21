var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    // =====================================
    StageBusiness.prototype.syncTable = function (paramObj) {
        var table_name = paramObj.table_name;
        var comp_code = paramObj.comp_code;
        if (table_name == 'ud_comp') {
            this.syncCompTable(comp_code);
        }
        else {
            this.syncModelTable();
        }
    };
    StageBusiness.prototype.syncCompTable = function (comp_code) {
        return __awaiter(this, void 0, void 0, function () {
            var codeMap, file_base, querySql, compList, i, compObj, file_path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeMap = {
                            'BaseInfo': 1,
                        };
                        file_base = this.const.resource_base + '/data_table/ud_comp';
                        querySql = 'select * from ud_comp';
                        return [4 /*yield*/, this.conchDao.queryTableAll(querySql)];
                    case 1:
                        compList = _a.sent();
                        for (i = 0; i < compList.length; i++) {
                            compObj = compList[i];
                            file_path = file_base + '/' + compObj.comp_code + '.json';
                            writeFileSync(file_path, JSON.stringify(compObj));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    StageBusiness.prototype.syncModelTable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file_base, querySql, compList, i, compObj, file_path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        file_base = this.const.resource_base + '/data_table/ud_model';
                        querySql = 'select * from ud_model';
                        return [4 /*yield*/, this.conchDao.queryTableAll(querySql)];
                    case 1:
                        compList = _a.sent();
                        for (i = 0; i < compList.length; i++) {
                            compObj = compList[i];
                            file_path = file_base + '/' + compObj.model_code + '.json';
                            writeFileSync(file_path, JSON.stringify(compObj));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return StageBusiness;
}());
export { StageBusiness };
//# sourceMappingURL=stage-business.js.map