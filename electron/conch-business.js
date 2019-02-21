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
    // 获取模型树
    ConchBusiness.prototype.getModelTree = function (res) {
        return __awaiter(this, void 0, void 0, function () {
            var rootNode, querySql, modelList, typeMap, i, modelObj, typeObj, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rootNode = {
                            'title': '模型',
                            'key': 'root',
                            'expanded': true,
                            'icon': 'anticon anticon-folder',
                            'children': []
                        };
                        querySql = 'select * from ud_model';
                        return [4 /*yield*/, this.conchDao.queryTableAll(querySql)];
                    case 1:
                        modelList = _a.sent();
                        typeMap = {};
                        for (i = 0; i < modelList.length; i++) {
                            modelObj = modelList[i];
                            typeObj = typeMap[modelObj.model_type];
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
                        for (key in typeMap) {
                            rootNode.children.push(typeMap[key]);
                        }
                        res.send(JSON.stringify({
                            status: 'success',
                            data: rootNode
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    // 保存模型
    ConchBusiness.prototype.saveModel = function (modelObj, res) {
        return __awaiter(this, void 0, void 0, function () {
            var updateSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateSql = "update ud_model set model_name = '" + modelObj.model_name + "',  model_data = '" + modelObj.model_data + "' where model_code = '" + modelObj.model_code + "';";
                        return [4 /*yield*/, this.conchDao.queryTableAll(updateSql)];
                    case 1:
                        _a.sent();
                        res.send(JSON.stringify({
                            status: 'success',
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
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