import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { TemplateBusiness } from './const/template-business';
import { GenFileService } from './const/gen-file.service';
import { ConchDao } from './const/conch-dao';
import { ConchFile } from './service/conch-file';
import { Const } from './const/const';
import * as _ts from 'typescript';
import { Parser } from './const/parser';
var ControlBusiness = /** @class */ (function () {
    function ControlBusiness() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
        this.parser = new Parser();
    }
    ControlBusiness.prototype.scanSubComp = function (projectObj) {
        var projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }
        var json_data = readFileSync(projectConchPath + '/s_htmlMap.json', { encoding: 'utf-8' });
        var htmlMap = JSON.parse(json_data);
        var component_name = projectObj.component_name;
        var treeData = {
            'title': component_name,
            'key': component_name,
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        };
        this.weaveHtmlStructRecu(component_name, treeData, htmlMap);
        return treeData;
    };
    ControlBusiness.prototype.scanRouting = function (projectObj) {
        var projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }
        var json_data = readFileSync(projectConchPath + '/s_routingMap.json', { encoding: 'utf-8' });
        var routingMap = JSON.parse(json_data);
        var parentMap = {};
        for (var i = 0; i < routingMap['AppRoutingModule'].length; i++) {
            var parentItem = routingMap['AppRoutingModule'][i];
            if (parentItem.loadChildren) {
                var key = parentItem.loadChildren.split('#')[1];
                parentMap[key] = parentItem.path;
            }
        }
        var curNodeFolder = {
            'title': projectObj.project_name,
            'key': projectObj.project_name,
            'expanded': true,
            'icon': 'anticon anticon-credit-card',
            'children': []
        };
        var routingList = [];
        for (var key in routingMap) {
            if (key != 'AppRoutingModule') {
                var keyChange = key.split('Routing')[0] + key.split('Routing')[1];
                var parentPath = parentMap[keyChange];
                var curNode = {
                    title: parentPath,
                    key: parentPath,
                    'expanded': true,
                    isLeaf: true,
                    'icon': 'anticon anticon-file',
                    'children': []
                };
                if (routingMap[key] && routingMap[key].length > 0) {
                    curNode.isLeaf = false;
                    curNode.icon = 'anticon anticon-folder';
                    this.weaveRouterListRecu(parentPath, routingMap[key], curNode);
                }
                curNodeFolder.children.push(curNode);
            }
        }
        return curNodeFolder;
    };
    ControlBusiness.prototype.scanProject = function (projectObj) {
        var projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }
        var root_path = projectObj.root_path + '/src/app';
        var moduleMap = {};
        var routingMap = {};
        var htmlMap = {};
        this.scanProjectAllRecu(root_path, '.', moduleMap, routingMap, htmlMap);
        setTimeout(function () {
            writeFileSync(projectConchPath + '/s_moduleMap.json', JSON.stringify(moduleMap));
            writeFileSync(projectConchPath + '/s_routingMap.json', JSON.stringify(routingMap));
            writeFileSync(projectConchPath + '/s_htmlMap.json', JSON.stringify(htmlMap));
        }, 15000);
    };
    ControlBusiness.prototype.getCompDomList = function (compType) {
        var compRows = this.conchDao.getDataJsonByName('ud_comp');
        var tmpRows = [];
        if (compType) {
            for (var i = 0; i < compRows.length; i++) {
                var compRow = compRows[i];
                if (compRow.comp_type == compType) {
                    tmpRows.push(compRow);
                }
            }
        }
        else {
            tmpRows = compRows;
        }
        var retDom = this.getDomItemList(tmpRows, false);
        var retDom2 = this.getDomItemList(tmpRows, true);
        return retDom + retDom2;
    };
    // =====================================
    ControlBusiness.prototype.weaveHtmlStructRecu = function (component_name, treeData, htmlMap) {
        if (htmlMap && htmlMap[component_name]) {
            var objList = htmlMap[component_name];
            for (var i = 0; i < objList.length; i++) {
                var key = objList[i];
                var subObj = {
                    'title': key,
                    'key': key,
                    'expanded': true,
                    'isLeaf': true,
                    'icon': 'anticon anticon-file',
                    'children': [],
                };
                if (htmlMap[key] && htmlMap[key].length > 0) {
                    subObj.isLeaf = false;
                    subObj.icon = 'anticon anticon-folder';
                    this.weaveHtmlStructRecu(key, subObj, htmlMap);
                }
                treeData.children.push(subObj);
            }
        }
    };
    ControlBusiness.prototype.weaveRouterListRecu = function (parentPath, routingList, curNodeFolder) {
        for (var i = 0; i < routingList.length; i++) {
            var routItem = routingList[i];
            if (routItem.component) {
                var curNode = {
                    title: parentPath + '/' + routItem.path,
                    key: routItem.component,
                    'expanded': true,
                    isLeaf: true,
                    'icon': 'anticon anticon-file',
                    'children': [],
                    component: routItem.component
                };
                if (routItem.children && routItem.children.length > 0) {
                    curNode.isLeaf = false;
                    curNode.icon = 'anticon anticon-folder';
                    this.weaveRouterListRecu(parentPath + '/' + routItem.path, routItem.children, curNode);
                }
                curNodeFolder.children.push(curNode);
            }
        }
    };
    ControlBusiness.prototype.scanProjectAllRecu2 = function (filePath, subPath, moduleMap, routingMap, htmlMap) {
        var that = this;
        var files = [];
        if (existsSync(filePath)) {
            files = readdirSync(filePath);
            files.forEach(function (file, index) {
                var curPath = filePath + '/' + file;
                if (statSync(curPath).isDirectory()) {
                    that.scanProjectAllRecu2(curPath, subPath + '/' + file, moduleMap, routingMap, htmlMap);
                }
                else if (file.indexOf('module.ts') != -1 || file.indexOf('routing.ts') != -1) {
                    var tmpMap_1 = {};
                    var curName_1 = '';
                    var jsonStr_1 = '';
                    var inBlock_1 = 0;
                    var readStream = createReadStream(curPath);
                    var readLine = createInterface({
                        input: readStream,
                    });
                    readLine.on('line', function (inLine) {
                        var line = inLine;
                        if (line.indexOf('//') != -1) {
                            line = line.substring(0, line.indexOf('//'));
                        }
                        if (file.indexOf('module.ts') != -1) {
                            if (line.indexOf('import ') != -1 && line.indexOf(' from ') != -1) {
                                var tmpStr = line;
                                tmpStr = tmpStr.substr(line.indexOf('import ') + 6);
                                var strArray = tmpStr.split(' from ');
                                var key = strArray[0].trim();
                                var value = strArray[1].trim();
                                if (key.startsWith('{') && (value.startsWith('\'.') || value.startsWith('\".'))) {
                                    var keyNew = key.substr(1, key.length - 2).trim();
                                    var valueNew = value.substr(1, value.length - 3).trim();
                                    if (valueNew.endsWith('.module') || valueNew.endsWith('.component')) {
                                        tmpMap_1[keyNew] = valueNew;
                                        console.log(keyNew + ' - ' + filePath + ' - ' + valueNew);
                                    }
                                }
                            }
                            else if (line.indexOf('export class') != -1) {
                                var index1 = line.indexOf('export class');
                                var index2 = line.indexOf('{');
                                curName_1 = line.substring(index1 + 12, index2).trim();
                            }
                        }
                        else if (file.indexOf('routing.ts') != -1) {
                            if (line.indexOf('Routes = [') != -1) {
                                inBlock_1++;
                                var tmpStr = line;
                                tmpStr = tmpStr.substr(line.indexOf('Routes =') + 8);
                                jsonStr_1 += tmpStr;
                            }
                            else if (inBlock_1 > 0 && line.indexOf(']') == -1 && line.indexOf('[') == -1) {
                                if (line.indexOf('component:') != -1) {
                                    var tmpStr = line.trim();
                                    if (tmpStr.endsWith(',')) {
                                        tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                                    }
                                    var tmpArray = tmpStr.split(':');
                                    jsonStr_1 += (tmpArray[0] + ':\'' + tmpArray[1].trim() + '\',');
                                }
                                else {
                                    jsonStr_1 += line;
                                }
                            }
                            else if (inBlock_1 == 1 && line.indexOf(']') != -1) {
                                inBlock_1--;
                                var tmpStr = line;
                                tmpStr = tmpStr.substr(0, line.indexOf(']') + 1);
                                jsonStr_1 += tmpStr;
                            }
                            else if (inBlock_1 > 1 && line.indexOf(']') != -1) {
                                inBlock_1--;
                                var tmpStr = line;
                                jsonStr_1 += tmpStr;
                            }
                            else if (inBlock_1 > 0 && line.indexOf('[') != -1) {
                                inBlock_1++;
                                var tmpStr = line;
                                jsonStr_1 += tmpStr;
                            }
                            if (line.indexOf('export class') != -1) {
                                var index1 = line.indexOf('export class');
                                var index2 = line.indexOf('{');
                                curName_1 = line.substring(index1 + 12, index2).trim();
                            }
                        }
                    });
                    readLine.on('close', function () {
                        moduleMap[curName_1] = tmpMap_1;
                        if (jsonStr_1) {
                            console.log();
                            console.log(jsonStr_1);
                            console.log();
                            var tmpRoutingList = eval('(' + jsonStr_1 + ')');
                            routingMap[curName_1] = tmpRoutingList;
                        }
                    });
                }
                else if (file.indexOf('component.html') != -1) {
                    var data = readFileSync(curPath, { encoding: 'utf-8' });
                    var $ = that.cheerio.load(data, {
                        decodeEntities: false,
                        _useHtmlParser2: true,
                        lowerCaseAttributeNames: false
                    });
                    var root_dom = $.root();
                    var childList = [];
                    var rootDom = root_dom[0];
                    that.getHtmlCompRecu(rootDom, childList);
                    var fileNew = file.split('.')[0];
                    var nameAll = that.getBigNameBySmall(fileNew);
                    nameAll += 'Component';
                    htmlMap[nameAll] = childList;
                }
            });
        }
    };
    ControlBusiness.prototype.scanProjectAllRecu = function (filePath, subPath, moduleMap, routingMap, htmlMap) {
        var that = this;
        var files = [];
        if (existsSync(filePath)) {
            files = readdirSync(filePath);
            files.forEach(function (file, index) {
                var curPath = filePath + '/' + file;
                if (statSync(curPath).isDirectory()) {
                    that.scanProjectAllRecu(curPath, subPath + '/' + file, moduleMap, routingMap, htmlMap);
                }
                else if (file.endsWith('.ts')) {
                    var data = readFileSync(curPath, { encoding: 'utf-8' });
                    var sourceFile = that.parser.parse(_ts, data, {
                        experimentalAsyncFunctions: true,
                        experimentalDecorators: true,
                        jsx: true
                    });
                    var curName_2 = '';
                    var tmpMap_2 = {};
                    var tmpRoutingList_1 = [];
                    sourceFile.statements.forEach(function (entry) {
                        // console.log(entry.kind);
                        // VariableStatement
                        if (entry.kind === 213) {
                            console.log('VariableStatement(213):' + entry.kind);
                            if (entry.declarationList && entry.declarationList.declarations) {
                                entry.declarationList.declarations.forEach(function (declaration) {
                                    if (declaration.type && declaration.type.typeName
                                        && declaration.type.typeName.escapedText === 'Routes') {
                                        console.log('TypeReference(161):' + 'Routes');
                                        console.log('name(231):' + declaration.name.escapedText);
                                        var elements = declaration.initializer.elements;
                                        that.parseRoutingChildRecu(elements, tmpRoutingList_1);
                                    }
                                });
                            }
                        }
                        // ImportDeclaration
                        if (entry.kind === 243 && entry.moduleSpecifier.text.startsWith('.')) {
                            console.log('ImportDeclaration(243):' + entry.moduleSpecifier.text);
                            if (entry.importClause && entry.importClause.namedBindings && entry.importClause.namedBindings.elements) {
                                var elements = entry.importClause.namedBindings.elements;
                                elements.forEach(function (element) {
                                    if (element.name) {
                                        console.log('name:' + element.name.escapedText);
                                        tmpMap_2[element.name.escapedText] = entry.moduleSpecifier.text;
                                    }
                                });
                            }
                        }
                        // ClassDeclaration
                        if (entry.kind === 234) {
                            console.log('ClassDeclaration(234):' + entry.name.escapedText);
                            curName_2 = entry.name.escapedText;
                            if (entry.decorators && entry.decorators.length > 0) {
                                console.log('[');
                                entry.decorators.forEach(function (decorator) {
                                    console.log('\t{');
                                    console.log('decorator:' + decorator.kind);
                                    // CallExpression
                                    if (decorator.expression.kind === 186) {
                                        var decoItem = decorator.expression;
                                        console.log('CallExpression(186):' + decoItem.expression.escapedText);
                                    }
                                    console.log('\t}');
                                });
                                console.log(']');
                            }
                        }
                    });
                    moduleMap[curName_2] = tmpMap_2;
                    if (tmpRoutingList_1.length > 0) {
                        routingMap[curName_2] = tmpRoutingList_1;
                    }
                }
                else if (file.indexOf('component.html') != -1) {
                    var data = readFileSync(curPath, { encoding: 'utf-8' });
                    var $ = that.cheerio.load(data, {
                        decodeEntities: false,
                        _useHtmlParser2: true,
                        lowerCaseAttributeNames: false
                    });
                    var root_dom = $.root();
                    var childList = [];
                    var rootDom = root_dom[0];
                    that.getHtmlCompRecu(rootDom, childList);
                    var fileNew = file.split('.')[0];
                    var nameAll = that.getBigNameBySmall(fileNew);
                    nameAll += 'Component';
                    htmlMap[nameAll] = childList;
                }
            });
        }
    };
    ControlBusiness.prototype.parseRoutingChildRecu = function (elements, tmpRoutingList) {
        var that = this;
        elements.forEach(function (element) {
            // ObjectLiteralExpression
            if (element.kind === 183) {
                var elementObj_1 = {};
                element.properties.forEach(function (prop) {
                    if (prop.name.escapedText === 'children') {
                        elementObj_1.children = [];
                        that.parseRoutingChildRecu(prop.initializer.elements, elementObj_1.children);
                    }
                    else {
                        elementObj_1[prop.name.escapedText] = prop.initializer.text;
                        console.log(prop.name.escapedText + ':' + prop.initializer.text);
                    }
                });
                tmpRoutingList.push(elementObj_1);
            }
        });
    };
    ControlBusiness.prototype.getHtmlCompRecu = function (rootDom, childList) {
        for (var i = 0; i < rootDom.children.length; i++) {
            var obj = rootDom.children[i];
            if (obj.type == 'tag' && obj.name.startsWith('app-')) {
                console.log(obj.name);
                var nameLit = obj.name.substring(4);
                var nameBig = this.getBigNameBySmall(nameLit) + 'Component';
                childList.push(nameBig);
            }
            else if (obj.type == 'tag') {
                this.getHtmlCompRecu(obj, childList);
            }
        }
    };
    ControlBusiness.prototype.getBigNameBySmall = function (fileNew) {
        var nameArray = fileNew.split('-');
        var nameAll = '';
        for (var i = 0; i < nameArray.length; i++) {
            var nameItem = nameArray[i];
            var nameNew = nameItem.charAt(0).toUpperCase() + nameItem.substring(1);
            nameAll += nameNew;
        }
        return nameAll;
    };
    ControlBusiness.prototype.getDomItemList = function (compRows, is_big) {
        // 拼装dom
        var retDom = '<div class="dom-list">';
        for (var i = 0; i < compRows.length; i++) {
            var compRow = compRows[i];
            if (is_big && compRow.comp_type != 'other') {
                continue;
            }
            else if (!is_big && compRow.comp_type == 'other') {
                continue;
            }
            if (is_big) {
                retDom += '<div class="dom-item big-show">';
            }
            else {
                retDom += '<div class="dom-item">';
            }
            retDom += '<div class="dom-inner-title">';
            retDom += compRow.comp_name;
            retDom += '</div>';
            retDom += '<div class="dom-inner-body">';
            retDom += compRow.comp_code;
            retDom += '</div>';
            retDom += '</div>';
        }
        retDom += '</div>';
        return retDom;
    };
    return ControlBusiness;
}());
export { ControlBusiness };
//# sourceMappingURL=control-business.js.map