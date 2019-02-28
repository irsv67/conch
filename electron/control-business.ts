import {createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'fs';
import {createInterface} from 'readline';
import {TemplateBusiness} from './const/template-business';
import {GenFileService} from './const/gen-file.service';
import {ConchDao} from './const/conch-dao';
import {ConchFile} from './service/conch-file';
import {Const} from './const/const';
import * as _ts from 'typescript';
import {Parser} from './const/parser';

export class ControlBusiness {

    conchDao: ConchDao;
    conchFile: ConchFile;
    cheerio: any;

    templateBusiness: TemplateBusiness;
    genFileService: GenFileService;
    const: Const;
    parser: any;

    constructor() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');

        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();

        this.parser = new Parser();
    }

    scanSubComp(projectObj: any) {

        const projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        const json_data = readFileSync(projectConchPath + '/s_htmlMap.json', {encoding: 'utf-8'});
        const htmlMap = JSON.parse(json_data);

        const component_name = projectObj.component_name;

        const treeData = {
            'title': component_name,
            'key': component_name,
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        };

        this.weaveHtmlStructRecu(component_name, treeData, htmlMap);

        return treeData;

    }

    scanRouting(projectObj: any) {
        const projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        const json_data = readFileSync(projectConchPath + '/s_routingMap.json', {encoding: 'utf-8'});
        const routingMap = JSON.parse(json_data);

        const parentMap = {};

        for (let i = 0; i < routingMap['root-routing'].length; i++) {
            const parentItem = routingMap['root-routing'][i];
            if (parentItem.loadChildren) {
                const key = parentItem.loadChildren.split('#')[1];
                parentMap[key] = parentItem.path;
            }
        }

        const curNodeFolder = {
            'title': projectObj.project_name,
            'key': projectObj.project_name,
            'expanded': true,
            'icon': 'anticon anticon-credit-card',
            'children': []
        };

        const routingList = [];

        for (const key in routingMap) {
            if (key !== 'root-routing') {

                const keyChange = key.split('Routing')[0] + key.split('Routing')[1];

                const parentPath = parentMap[keyChange];

                const curNode = {
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
    }

    scanProject(projectObj: any) {

        const projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        const root_path = projectObj.root_path + '/src/app';
        const moduleMap = {};
        const routingMap = {};
        const htmlMap = {};
        this.scanProjectAllRecu(root_path, '.', moduleMap, routingMap, htmlMap);

        setTimeout(function () {

            writeFileSync(projectConchPath + '/s_moduleMap.json', JSON.stringify(moduleMap));

            writeFileSync(projectConchPath + '/s_routingMap.json', JSON.stringify(routingMap));

            writeFileSync(projectConchPath + '/s_htmlMap.json', JSON.stringify(htmlMap));

        }, 3000);
    }

    getCompDomList(compType: any) {

        const compRows = this.conchDao.getDataJsonByName('ud_comp');
        let tmpRows = [];
        if (compType) {
            for (let i = 0; i < compRows.length; i++) {
                const compRow = compRows[i];
                if (compRow.comp_type === compType) {
                    tmpRows.push(compRow);
                }
            }
        } else {
            tmpRows = compRows;
        }

        const retDom = this.getDomItemList(tmpRows, false);
        const retDom2 = this.getDomItemList(tmpRows, true);

        return retDom + retDom2;
    }

    // =====================================

    weaveHtmlStructRecu(component_name, treeData, htmlMap) {

        if (htmlMap && htmlMap[component_name]) {
            const objList = htmlMap[component_name];
            for (let i = 0; i < objList.length; i++) {
                const key = objList[i];
                const subObj = {
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
    }

    weaveRouterListRecu(parentPath, routingList, curNodeFolder) {

        for (let i = 0; i < routingList.length; i++) {
            const routItem = routingList[i];
            if (routItem.component) {
                const curNode = {
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
    }

    scanProjectAllRecu(filePath, subPath, moduleMap, routingMap, htmlMap) {
        const that = this;

        let files = [];
        if (existsSync(filePath)) {
            files = readdirSync(filePath);
            files.forEach(function (file: string, index) {
                const curPath = filePath + '/' + file;
                if (statSync(curPath).isDirectory()) {
                    that.scanProjectAllRecu(curPath, subPath + '/' + file, moduleMap, routingMap, htmlMap);
                } else if (file.endsWith('.ts')) {

                    const data = readFileSync(curPath, {encoding: 'utf-8'});

                    const sourceFile = that.parser.parse(_ts, data, {
                        experimentalAsyncFunctions: true,
                        experimentalDecorators: true,
                        jsx: true
                    });

                    let curName = '';
                    let curType = '';
                    let rootRouting = false;
                    const tmpMap = {};
                    const tmpRoutingList = [];

                    sourceFile.statements.forEach((entry: any) => {
                        // console.log(entry.kind);

                        // VariableStatement
                        if (entry.kind === 213) {
                            console.log('VariableStatement(213):' + entry.kind);
                            if (entry.declarationList && entry.declarationList.declarations) {
                                entry.declarationList.declarations.forEach((declaration: any) => {
                                    if (declaration.type && declaration.type.typeName
                                        && declaration.type.typeName.escapedText === 'Routes') {
                                        console.log('TypeReference(161):' + 'Routes');
                                        console.log('name(231):' + declaration.name.escapedText);

                                        const elements = declaration.initializer.elements;
                                        that.parseRoutingChildRecu(elements, tmpRoutingList);
                                    }
                                });
                            }

                        }

                        // ImportDeclaration
                        if (entry.kind === 243 && entry.moduleSpecifier.text.startsWith('.')) {
                            console.log('ImportDeclaration(243):' + entry.moduleSpecifier.text);
                            if (entry.importClause && entry.importClause.namedBindings && entry.importClause.namedBindings.elements) {
                                const elements: any = entry.importClause.namedBindings.elements;
                                elements.forEach((element: any) => {
                                    if (element.name) {
                                        console.log('name:' + element.name.escapedText);
                                        tmpMap[element.name.escapedText] = entry.moduleSpecifier.text;
                                    }
                                });
                            }
                        }
                        // ClassDeclaration
                        if (entry.kind === 234) {
                            console.log('ClassDeclaration(234):' + entry.name.escapedText);
                            curName = entry.name.escapedText;
                            if (entry.decorators && entry.decorators.length > 0) {
                                console.log('[');
                                entry.decorators.forEach((decorator: any) => {
                                    console.log('\t{');
                                    console.log('decorator:' + decorator.kind);
                                    // CallExpression
                                    if (decorator.expression.kind === 186) {
                                        const decoItem = decorator.expression;
                                        console.log('CallExpression(186):' + decoItem.expression.escapedText);
                                        curType = decoItem.expression.escapedText;

                                        if (decoItem.arguments && decoItem.arguments.length > 0
                                            && decoItem.arguments[0].properties && decoItem.arguments[0].properties.length > 0) {
                                            decoItem.arguments[0].properties.forEach((argumnet: any) => {
                                                console.log(argumnet.name.escapedText + ':'
                                                    + (argumnet.initializer.text || argumnet.initializer.elements));
                                                // 识别 RouterModule.forRoot();
                                                if (argumnet.name.escapedText === 'imports') {
                                                    argumnet.initializer.elements.forEach((item: any) => {
                                                        // CallExpression
                                                        if (item.kind === 186) {
                                                            const expression = item.expression;
                                                            if (expression.name.escapedText === 'forRoot'
                                                                && expression.expression.escapedText === 'RouterModule') {
                                                                rootRouting = true;
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

                    if (curType === 'NgModule' || curType === 'Component' || curType === 'Injectable') {
                        moduleMap[curName] = tmpMap;
                    }
                    if (tmpRoutingList.length > 0) {
                        routingMap[curName] = tmpRoutingList;
                    }

                } else if (file.indexOf('component.html') !== -1) {

                    const data = readFileSync(curPath, {encoding: 'utf-8'});

                    const $ = that.cheerio.load(data, {
                        decodeEntities: false,
                        _useHtmlParser2: true,
                        lowerCaseAttributeNames: false
                    });

                    const root_dom = $.root();

                    const childList = [];
                    const rootDom = root_dom[0];
                    that.getHtmlCompRecu(rootDom, childList);

                    const fileNew = file.split('.')[0];
                    let nameAll = that.getBigNameBySmall(fileNew);

                    nameAll += 'Component';

                    htmlMap[nameAll] = childList;
                }
            });
        }
    }

    private parseRoutingChildRecu(elements, tmpRoutingList) {
        const that = this;
        elements.forEach((element: any) => {

            // ObjectLiteralExpression
            if (element.kind === 183) {

                const elementObj: any = {};

                element.properties.forEach((prop: any) => {
                    if (prop.name.escapedText === 'children') {
                        elementObj.children = [];
                        that.parseRoutingChildRecu(prop.initializer.elements, elementObj.children);
                    } else {
                        elementObj[prop.name.escapedText] = prop.initializer.text;
                        console.log(prop.name.escapedText + ':' + prop.initializer.text);
                    }
                });

                tmpRoutingList.push(elementObj);

            }
        });
    }

    private getHtmlCompRecu(rootDom, childList) {
        for (let i = 0; i < rootDom.children.length; i++) {
            const obj = rootDom.children[i];
            if (obj.type === 'tag' && obj.name.startsWith('app-')) {
                console.log(obj.name);

                const nameLit = obj.name.substring(4);
                const nameBig = this.getBigNameBySmall(nameLit) + 'Component';
                childList.push(nameBig);

            } else if (obj.type === 'tag') {
                this.getHtmlCompRecu(obj, childList);
            }
        }
    }

    private getBigNameBySmall(fileNew) {
        const nameArray = fileNew.split('-');
        let nameAll = '';
        for (let i = 0; i < nameArray.length; i++) {
            const nameItem = nameArray[i];
            const nameNew = nameItem.charAt(0).toUpperCase() + nameItem.substring(1);
            nameAll += nameNew;
        }
        return nameAll;
    }

    private getDomItemList(compRows: any, is_big) {
        // 拼装dom
        let retDom = '<div class="dom-list">';
        for (let i = 0; i < compRows.length; i++) {
            const compRow = compRows[i];

            if (is_big && compRow.comp_type !== 'other') {
                continue;
            } else if (!is_big && compRow.comp_type === 'other') {
                continue;
            }

            if (is_big) {
                retDom += '<div class="dom-item big-show">';
            } else {
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
