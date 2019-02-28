import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
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
        for (var i = 0; i < routingMap['root-routing'].length; i++) {
            var parentItem = routingMap['root-routing'][i];
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
            if (key !== 'root-routing') {
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
        }, 3000);
    };
    ControlBusiness.prototype.getCompDomList = function (compType) {
        var compRows = this.conchDao.getDataJsonByName('ud_comp');
        var tmpRows = [];
        if (compType) {
            for (var i = 0; i < compRows.length; i++) {
                var compRow = compRows[i];
                if (compRow.comp_type === compType) {
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
                    var curName_1 = '';
                    var curType_1 = '';
                    var rootRouting_1 = false;
                    var tmpMap_1 = {};
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
                                        tmpMap_1[element.name.escapedText] = entry.moduleSpecifier.text;
                                    }
                                });
                            }
                        }
                        // ClassDeclaration
                        if (entry.kind === 234) {
                            console.log('ClassDeclaration(234):' + entry.name.escapedText);
                            curName_1 = entry.name.escapedText;
                            if (entry.decorators && entry.decorators.length > 0) {
                                console.log('[');
                                entry.decorators.forEach(function (decorator) {
                                    console.log('\t{');
                                    console.log('decorator:' + decorator.kind);
                                    // CallExpression
                                    if (decorator.expression.kind === 186) {
                                        var decoItem = decorator.expression;
                                        console.log('CallExpression(186):' + decoItem.expression.escapedText);
                                        curType_1 = decoItem.expression.escapedText;
                                        if (decoItem.arguments && decoItem.arguments.length > 0
                                            && decoItem.arguments[0].properties && decoItem.arguments[0].properties.length > 0) {
                                            decoItem.arguments[0].properties.forEach(function (argumnet) {
                                                console.log(argumnet.name.escapedText + ':'
                                                    + (argumnet.initializer.text || argumnet.initializer.elements));
                                                // 识别 RouterModule.forRoot();
                                                if (argumnet.name.escapedText === 'imports') {
                                                    argumnet.initializer.elements.forEach(function (item) {
                                                        // CallExpression
                                                        if (item.kind === 186) {
                                                            var expression = item.expression;
                                                            if (expression.name.escapedText === 'forRoot'
                                                                && expression.expression.escapedText === 'RouterModule') {
                                                                rootRouting_1 = true;
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                    console.log('\t}');
                                });
                                console.log(']');
                            }
                        }
                    });
                    if (curType_1 === 'NgModule' || curType_1 === 'Component' || curType_1 === 'Injectable') {
                        moduleMap[curName_1] = tmpMap_1;
                    }
                    if (tmpRoutingList_1.length > 0) {
                        routingMap[curName_1] = tmpRoutingList_1;
                    }
                }
                else if (file.indexOf('component.html') !== -1) {
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
            if (obj.type === 'tag' && obj.name.startsWith('app-')) {
                console.log(obj.name);
                var nameLit = obj.name.substring(4);
                var nameBig = this.getBigNameBySmall(nameLit) + 'Component';
                childList.push(nameBig);
            }
            else if (obj.type === 'tag') {
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
            if (is_big && compRow.comp_type !== 'other') {
                continue;
            }
            else if (!is_big && compRow.comp_type === 'other') {
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