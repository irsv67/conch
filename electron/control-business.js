"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const readline_1 = require("readline");
const template_business_1 = require("./const/template-business");
const gen_file_service_1 = require("./const/gen-file.service");
const conch_dao_1 = require("./const/conch-dao");
const conch_file_1 = require("./service/conch-file");
const const_1 = require("./const/const");
class ControlBusiness {
    constructor() {
        this.conchDao = new conch_dao_1.ConchDao();
        this.conchFile = new conch_file_1.ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new template_business_1.TemplateBusiness();
        this.genFileService = new gen_file_service_1.GenFileService();
        this.const = new const_1.Const();
    }
    scanSubComp(projectObj) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!fs_1.existsSync(projectConchPath)) {
            fs_1.mkdirSync(projectConchPath);
        }
        let json_data = fs_1.readFileSync(projectConchPath + '/s_htmlMap.json', { encoding: 'utf-8' });
        let htmlMap = JSON.parse(json_data);
        let component_name = projectObj.component_name;
        let treeData = {
            "title": component_name,
            "key": component_name,
            "expanded": true,
            "icon": "anticon anticon-folder",
            "children": []
        };
        this.weaveHtmlStructRecu(component_name, treeData, htmlMap);
        return treeData;
    }
    scanRouting(projectObj) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!fs_1.existsSync(projectConchPath)) {
            fs_1.mkdirSync(projectConchPath);
        }
        let json_data = fs_1.readFileSync(projectConchPath + '/s_routingMap.json', { encoding: 'utf-8' });
        let routingMap = JSON.parse(json_data);
        let parentMap = {};
        for (let i = 0; i < routingMap['AppRoutingModule'].length; i++) {
            const parentItem = routingMap['AppRoutingModule'][i];
            if (parentItem.loadChildren) {
                let key = parentItem.loadChildren.split('#')[1];
                parentMap[key] = parentItem.path;
            }
        }
        let curNodeFolder = {
            "title": projectObj.project_name,
            "key": projectObj.project_name,
            "expanded": true,
            "icon": "anticon anticon-credit-card",
            "children": []
        };
        let routingList = [];
        for (let key in routingMap) {
            if (key != 'AppRoutingModule') {
                let keyChange = key.split('Routing')[0] + key.split('Routing')[1];
                let parentPath = parentMap[keyChange];
                let curNode = {
                    title: parentPath,
                    key: parentPath,
                    "expanded": true,
                    isLeaf: true,
                    "icon": "anticon anticon-file",
                    "children": []
                };
                if (routingMap[key] && routingMap[key].length > 0) {
                    curNode.isLeaf = false;
                    curNode.icon = "anticon anticon-folder";
                    this.weaveRouterListRecu(parentPath, routingMap[key], curNode);
                }
                curNodeFolder.children.push(curNode);
            }
        }
        return curNodeFolder;
    }
    scanProject(projectObj) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!fs_1.existsSync(projectConchPath)) {
            fs_1.mkdirSync(projectConchPath);
        }
        let root_path = projectObj.root_path + '/src/app';
        let moduleMap = {};
        let routingMap = {};
        let htmlMap = {};
        this.scanProjectAllRecu(root_path, '.', moduleMap, routingMap, htmlMap);
        setTimeout(function () {
            fs_1.writeFileSync(projectConchPath + '/s_moduleMap.json', JSON.stringify(moduleMap));
            fs_1.writeFileSync(projectConchPath + '/s_routingMap.json', JSON.stringify(routingMap));
            fs_1.writeFileSync(projectConchPath + '/s_htmlMap.json', JSON.stringify(htmlMap));
        }, 3000);
    }
    getCompDomList(compType) {
        let compRows = this.conchDao.getDataJsonByName('ud_comp');
        let tmpRows = [];
        if (compType) {
            for (let i = 0; i < compRows.length; i++) {
                const compRow = compRows[i];
                if (compRow.comp_type == compType) {
                    tmpRows.push(compRow);
                }
            }
        }
        else {
            tmpRows = compRows;
        }
        let retDom = this.getDomItemList(tmpRows, false);
        let retDom2 = this.getDomItemList(tmpRows, true);
        return retDom + retDom2;
    }
    //=====================================
    weaveHtmlStructRecu(component_name, treeData, htmlMap) {
        if (htmlMap && htmlMap[component_name]) {
            let objList = htmlMap[component_name];
            for (let i = 0; i < objList.length; i++) {
                const key = objList[i];
                let subObj = {
                    "title": key,
                    "key": key,
                    "expanded": true,
                    "isLeaf": true,
                    "icon": "anticon anticon-file",
                    "children": [],
                };
                if (htmlMap[key] && htmlMap[key].length > 0) {
                    subObj.isLeaf = false;
                    subObj.icon = "anticon anticon-folder";
                    this.weaveHtmlStructRecu(key, subObj, htmlMap);
                }
                treeData.children.push(subObj);
            }
        }
    }
    weaveRouterListRecu(parentPath, routingList, curNodeFolder) {
        for (let i = 0; i < routingList.length; i++) {
            const routItem = routingList[i];
            if (routItem.component) {
                let curNode = {
                    title: parentPath + '/' + routItem.path,
                    key: routItem.component,
                    "expanded": true,
                    isLeaf: true,
                    "icon": "anticon anticon-file",
                    "children": [],
                    component: routItem.component
                };
                if (routItem.children && routItem.children.length > 0) {
                    curNode.isLeaf = false;
                    curNode.icon = "anticon anticon-folder";
                    this.weaveRouterListRecu(parentPath + '/' + routItem.path, routItem.children, curNode);
                }
                curNodeFolder.children.push(curNode);
            }
        }
    }
    scanProjectAllRecu(filePath, subPath, moduleMap, routingMap, htmlMap) {
        const that = this;
        let files = [];
        if (fs_1.existsSync(filePath)) {
            files = fs_1.readdirSync(filePath);
            files.forEach(function (file, index) {
                let curPath = filePath + "/" + file;
                if (fs_1.statSync(curPath).isDirectory()) {
                    that.scanProjectAllRecu(curPath, subPath + "/" + file, moduleMap, routingMap, htmlMap);
                }
                else if (file.indexOf('module.ts') != -1 || file.indexOf('routing.ts') != -1) {
                    let tmpMap = {};
                    let curName = '';
                    let jsonStr = '';
                    let inBlock = 0;
                    let readStream = fs_1.createReadStream(curPath);
                    let readLine = readline_1.createInterface({
                        input: readStream,
                    });
                    readLine.on('line', (inLine) => {
                        let line = inLine;
                        if (line.indexOf('//') != -1) {
                            line = line.substring(0, line.indexOf('//'));
                        }
                        if (file.indexOf('module.ts') != -1) {
                            if (line.indexOf('import ') != -1 && line.indexOf(' from ') != -1) {
                                let tmpStr = line;
                                tmpStr = tmpStr.substr(line.indexOf('import ') + 6);
                                let strArray = tmpStr.split(' from ');
                                let key = strArray[0].trim();
                                let value = strArray[1].trim();
                                if (key.startsWith('{') && (value.startsWith('\'.') || value.startsWith('\".'))) {
                                    let keyNew = key.substr(1, key.length - 2).trim();
                                    let valueNew = value.substr(1, value.length - 3).trim();
                                    if (valueNew.endsWith('.module') || valueNew.endsWith('.component')) {
                                        tmpMap[keyNew] = valueNew;
                                        console.log(keyNew + ' - ' + filePath + ' - ' + valueNew);
                                    }
                                }
                            }
                            else if (line.indexOf('export class') != -1) {
                                let index1 = line.indexOf('export class');
                                let index2 = line.indexOf('{');
                                curName = line.substring(index1 + 12, index2).trim();
                            }
                        }
                        else if (file.indexOf('routing.ts') != -1) {
                            if (line.indexOf('Routes = [') != -1) {
                                inBlock++;
                                let tmpStr = line;
                                tmpStr = tmpStr.substr(line.indexOf('Routes =') + 8);
                                jsonStr += tmpStr;
                            }
                            else if (inBlock > 0 && line.indexOf(']') == -1 && line.indexOf('[') == -1) {
                                if (line.indexOf('component:') != -1) {
                                    let tmpStr = line.trim();
                                    if (tmpStr.endsWith(',')) {
                                        tmpStr = tmpStr.substr(0, tmpStr.length - 1);
                                    }
                                    let tmpArray = tmpStr.split(':');
                                    jsonStr += (tmpArray[0] + ':\'' + tmpArray[1].trim() + '\',');
                                }
                                else {
                                    jsonStr += line;
                                }
                            }
                            else if (inBlock == 1 && line.indexOf(']') != -1) {
                                inBlock--;
                                let tmpStr = line;
                                tmpStr = tmpStr.substr(0, line.indexOf(']') + 1);
                                jsonStr += tmpStr;
                            }
                            else if (inBlock > 1 && line.indexOf(']') != -1) {
                                inBlock--;
                                let tmpStr = line;
                                jsonStr += tmpStr;
                            }
                            else if (inBlock > 0 && line.indexOf('[') != -1) {
                                inBlock++;
                                let tmpStr = line;
                                jsonStr += tmpStr;
                            }
                            if (line.indexOf('export class') != -1) {
                                let index1 = line.indexOf('export class');
                                let index2 = line.indexOf('{');
                                curName = line.substring(index1 + 12, index2).trim();
                            }
                        }
                    });
                    readLine.on('close', () => {
                        moduleMap[curName] = tmpMap;
                        if (jsonStr) {
                            console.log();
                            console.log(jsonStr);
                            console.log();
                            let tmpRoutingList = eval('(' + jsonStr + ')');
                            routingMap[curName] = tmpRoutingList;
                        }
                    });
                }
                else if (file.indexOf('component.html') != -1) {
                    let data = fs_1.readFileSync(curPath, { encoding: 'utf-8' });
                    let $ = that.cheerio.load(data, {
                        decodeEntities: false,
                        _useHtmlParser2: true,
                        lowerCaseAttributeNames: false
                    });
                    let root_dom = $.root();
                    let childList = [];
                    let rootDom = root_dom[0];
                    that.getHtmlCompRecu(rootDom, childList);
                    let fileNew = file.split('.')[0];
                    let nameAll = that.getBigNameBySmall(fileNew);
                    nameAll += 'Component';
                    htmlMap[nameAll] = childList;
                }
            });
        }
    }
    getHtmlCompRecu(rootDom, childList) {
        for (let i = 0; i < rootDom.children.length; i++) {
            let obj = rootDom.children[i];
            if (obj.type == 'tag' && obj.name.startsWith('app-')) {
                console.log(obj.name);
                let nameLit = obj.name.substring(4);
                let nameBig = this.getBigNameBySmall(nameLit) + 'Component';
                childList.push(nameBig);
            }
            else if (obj.type == 'tag') {
                this.getHtmlCompRecu(obj, childList);
            }
        }
    }
    getBigNameBySmall(fileNew) {
        let nameArray = fileNew.split('-');
        let nameAll = '';
        for (let i = 0; i < nameArray.length; i++) {
            const nameItem = nameArray[i];
            let nameNew = nameItem.charAt(0).toUpperCase() + nameItem.substring(1);
            nameAll += nameNew;
        }
        return nameAll;
    }
    getDomItemList(compRows, is_big) {
        // 拼装dom
        let retDom = '<div class="dom-list">';
        for (let i = 0; i < compRows.length; i++) {
            const compRow = compRows[i];
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
    }
}
exports.ControlBusiness = ControlBusiness;
//# sourceMappingURL=control-business.js.map