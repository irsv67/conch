"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conch_dao_1 = require("../const/conch-dao");
const fs_1 = require("fs");
const os_1 = require("os");
const readline_1 = require("readline");
const template_business_1 = require("../const/template-business");
const gen_file_service_1 = require("../const/gen-file.service");
const ejs_1 = require("ejs");
const const_1 = require("../const/const");
class ConchFile {
    constructor() {
        this.conchDao = new conch_dao_1.ConchDao();
        this.cheerio = require('cheerio');
        this.templateBusiness = new template_business_1.TemplateBusiness();
        this.genFileService = new gen_file_service_1.GenFileService();
        this.const = new const_1.Const();
    }
    // 递归拼装html
    weaveHtmlRecu(curNode, compMap, fieldName, keyMap) {
        let index = keyMap[curNode.key];
        let modelObj = {
            model_config: curNode.model_config || {},
            model_data: curNode.model_data_map || {},
            index: index
        };
        let htmlTemp;
        if (!curNode.comp_code) {
            htmlTemp = `<div class="RootConch conch-item" style="background-color: rgba(235,237,240,1);"></div>`;
        }
        else if (curNode.comp_code == 'LayoutColumn' || curNode.comp_code == 'LayoutRow') {
            htmlTemp = `<div class="${curNode.comp_code} ${curNode.comp_code}_${index} conch-item">`;
            htmlTemp += `</div>`;
        }
        else {
            let compObj = compMap[curNode.comp_code];
            if (compObj[fieldName]) {
                htmlTemp = `<div class="${curNode.comp_code}_${index} conch-item">`;
                htmlTemp += ejs_1.render(compObj[fieldName], modelObj);
                htmlTemp += `</div>`;
            }
        }
        let $ = this.cheerio.load(htmlTemp, {
            decodeEntities: false,
            _useHtmlParser2: true,
            lowerCaseAttributeNames: false
        });
        let root_dom = $.root().children();
        for (let i = 0; i < curNode.children.length; i++) {
            const subNode = curNode.children[i];
            let subDom = this.weaveHtmlRecu(subNode, compMap, fieldName, keyMap);
            root_dom.append(subDom);
        }
        return $.html();
    }
    weaveStyleRecu(curNode, compMap, fieldName, keyMap) {
        let index = keyMap[curNode.key];
        let constStyleConfig = {
            widthAuto: true,
            width: 'auto',
            heightAuto: true,
            height: 'auto',
            flex: 'none',
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            background: '',
            borderRadius: '',
            boxShadow: false,
        };
        Object.assign(constStyleConfig, curNode.style_config);
        let styleObj = Object.assign(constStyleConfig, curNode.style_config) || {};
        //=================
        let styleTemp = `.${curNode.comp_code}_${index} {\r\n`;
        styleTemp += 'width: ' + styleObj.width + ';\r\n';
        styleTemp += 'height: ' + styleObj.height + ';\r\n';
        styleTemp += 'flex: ' + styleObj.flex + ';\r\n';
        styleTemp += 'margin: ' + styleObj.marginTop + 'px ' + styleObj.marginRight + 'px ' + styleObj.marginBottom + 'px ' + styleObj.marginLeft + 'px' + ';\r\n';
        styleTemp += 'padding: ' + styleObj.paddingTop + 'px ' + styleObj.paddingRight + 'px ' + styleObj.paddingBottom + 'px ' + styleObj.paddingLeft + 'px' + ';\r\n';
        if (styleObj.background) {
            styleTemp += 'background: ' + styleObj.background + ';\r\n';
        }
        if (styleObj.borderRadius) {
            styleTemp += 'border-radius: ' + styleObj.borderRadius + ';\r\n';
        }
        if (styleObj.boxShadow) {
            styleTemp += 'box-shadow: 0 1px 2px 0 rgba(23, 35, 61, 0.15)' + ';\r\n';
        }
        styleTemp += '}\r\n\r\n';
        if (curNode.comp_code && styleTemp != '') {
            styleTemp = `\r\n/*-${curNode.comp_code}-*/\r\n` + styleTemp;
        }
        for (let i = 0; i < curNode.children.length; i++) {
            const subNode = curNode.children[i];
            let subStyle = this.weaveStyleRecu(subNode, compMap, fieldName, keyMap);
            styleTemp += subStyle;
        }
        return styleTemp;
    }
    weaveScriptRecu(curNode, compMap, fieldName, keyMap) {
        let index = keyMap[curNode.key];
        let modelObj = {
            model_config: curNode.model_config || {},
            model_data: curNode.model_data_map || {},
            index: index
        };
        let scriptTemp = '';
        if (curNode.comp_code && curNode.comp_code != 'LayoutRow' && curNode.comp_code != 'LayoutColumn') {
            let compObj = compMap[curNode.comp_code];
            if (compObj[fieldName]) {
                scriptTemp += ejs_1.render(compObj[fieldName], modelObj);
            }
        }
        if (curNode.comp_code && scriptTemp != '') {
            if (fieldName == 'style_temp') {
                scriptTemp = `\r\n/*-${curNode.comp_code}-*/\r\n` + scriptTemp;
            }
            else {
                scriptTemp = `\r\n    // -${curNode.comp_code}-\r\n` + scriptTemp;
            }
        }
        for (let i = 0; i < curNode.children.length; i++) {
            const subNode = curNode.children[i];
            let subScript = this.weaveScriptRecu(subNode, compMap, fieldName, keyMap);
            scriptTemp += subScript;
        }
        return scriptTemp;
    }
    // ==================================
    // 植入html代码
    weaveHtmlAll(pageVO, compMap, keyMap) {
        let pageSchemaObj = JSON.parse(pageVO.page_schema);
        let htmlTemp = this.weaveHtmlRecu(pageSchemaObj, compMap, 'html_temp', keyMap);
        let sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.html';
        let file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(file_path);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        let blockFound = false;
        readLine.on('line', (line) => {
            if (line.indexOf('include_start') != -1) {
                blockFound = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(htmlTemp + os_1.EOL);
            }
            else if (line.indexOf('include_end') != -1) {
                writeStream.write(line + os_1.EOL);
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', () => {
        });
    }
    weaveInstanceDataRecu(curNode, keyMap, instanceObj) {
        if (curNode.comp_code) {
            let index = keyMap[curNode.key];
            curNode.model_config.model_data = curNode.model_data_map || {};
            instanceObj[curNode.comp_code + '_' + index] = curNode.model_config;
        }
        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const subNode = curNode.children[i];
                this.weaveInstanceDataRecu(subNode, keyMap, instanceObj);
            }
        }
    }
    // 植入script代码
    weaveScriptAll(pageVO, compMap, keyMap) {
        let pageSchemaObj = JSON.parse(pageVO.page_schema);
        let instanceObj = {};
        this.weaveInstanceDataRecu(pageSchemaObj, keyMap, instanceObj);
        let instanceStr = 'instanceHandler: any = ' + JSON.stringify(instanceObj) + ';';
        let temp_data_import = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_import', keyMap);
        let temp_data_attr = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_attr', keyMap);
        let temp_data_func = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_func', keyMap);
        let temp_data_init = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_init', keyMap);
        let sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.ts';
        let file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(file_path);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        let block_found_import = false;
        let block_found_attr = false;
        let block_found_func = false;
        let block_found_init = false;
        readLine.on('line', (line) => {
            if (line.indexOf('script_import_start') != -1) {
                block_found_import = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(temp_data_import + os_1.EOL);
            }
            else if (line.indexOf('script_import_end') != -1) {
                writeStream.write(line + os_1.EOL);
                block_found_import = false;
            }
            else if (line.indexOf('script_attr_start') != -1) {
                block_found_attr = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(instanceStr + os_1.EOL);
                writeStream.write(temp_data_attr + os_1.EOL);
            }
            else if (line.indexOf('script_attr_end') != -1) {
                writeStream.write(line + os_1.EOL);
                block_found_attr = false;
            }
            else if (line.indexOf('script_func_start') != -1) {
                block_found_func = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(temp_data_func + os_1.EOL);
            }
            else if (line.indexOf('script_func_end') != -1) {
                writeStream.write(line + os_1.EOL);
                block_found_func = false;
            }
            else if (line.indexOf('script_init_start') != -1) {
                block_found_init = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(temp_data_init + os_1.EOL);
            }
            else if (line.indexOf('script_init_end') != -1) {
                writeStream.write(line + os_1.EOL);
                block_found_init = false;
            }
            else if (!block_found_import && !block_found_attr && !block_found_func && !block_found_init) {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', () => {
        });
    }
    // 植入style代码
    weaveStyleAll(pageVO, compMap, keyMap) {
        let pageSchemaObj = JSON.parse(pageVO.page_schema);
        let scriptTemp = this.weaveScriptRecu(pageSchemaObj, compMap, 'style_temp', keyMap);
        let styleTemp = this.weaveStyleRecu(pageSchemaObj, compMap, 'style_temp', keyMap);
        let sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.css';
        let file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(file_path);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        let blockFound = false;
        readLine.on('line', (line) => {
            if (line.indexOf('include_start') != -1) {
                blockFound = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(styleTemp + os_1.EOL);
                writeStream.write(scriptTemp + os_1.EOL);
            }
            else if (line.indexOf('include_end') != -1) {
                writeStream.write(line + os_1.EOL);
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', () => {
        });
    }
    // ==================================
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
    // 植入路由代码
    weaveModule(pageVO, fileMap) {
        const that = this;
        let str_import_all = '';
        let str_declare_all = '';
        for (let fileName in fileMap) {
            let upperName = that.getBigNameBySmall(fileName);
            str_import_all += `import {${upperName}Component} from './${fileName}/${fileName}.component';\r\n`;
            str_declare_all += `${upperName}Component,\r\n`;
        }
        let sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.module.ts';
        let file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(file_path);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        let importIn = false;
        let declareIn = false;
        readLine.on('line', (line) => {
            if (line.indexOf('module_import_start') != -1) {
                importIn = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(str_import_all + os_1.EOL);
            }
            else if (line.indexOf('module_declarations_start') != -1) {
                declareIn = true;
                writeStream.write(line + os_1.EOL);
                writeStream.write(str_declare_all + os_1.EOL);
            }
            else if (line.indexOf('module_import_end') != -1) {
                importIn = false;
                writeStream.write(line + os_1.EOL);
            }
            else if (line.indexOf('module_declarations_end') != -1) {
                declareIn = false;
                writeStream.write(line + os_1.EOL);
            }
            else if (!importIn && !declareIn) {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(file_path, data);
            }, 1000);
        });
    }
    // ==================================
    // 植入路由代码
    weaveRouter(base_app, folderPath, pageName, pageNameUpper) {
        let str_router = this.templateBusiness.getRouterStr(folderPath, pageName, pageNameUpper);
        let compUrl = base_app + '/app.routing.ts';
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(compUrl);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        readLine.on('line', (line) => {
            if (line.indexOf('include_start') != -1) {
                writeStream.write(line + os_1.EOL);
                writeStream.write('    // ----block_start_' + pageName + '----' + os_1.EOL);
                writeStream.write(str_router + os_1.EOL);
                writeStream.write('    // ----block_end_' + pageName + '----' + os_1.EOL);
                writeStream.write(os_1.EOL);
            }
            else {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(compUrl, data);
            }, 1000);
        });
    }
    // 删除路由,菜单代码
    removeItemScript(filePath, conchId) {
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(filePath);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        let blockFound = false;
        readLine.on('line', (line) => {
            if (line.indexOf('block_start_' + conchId) != -1) {
                blockFound = true;
            }
            else if (line.indexOf('block_end_' + conchId) != -1) {
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(filePath, data);
            }, 1000);
        });
        writeStream.on('end', () => {
        });
    }
    // ==================================
    // 植入菜单代码
    weaveMenu(base_app, folderPath, pageName, pageNameUpper, page_desc) {
        let menuName = page_desc ? (page_desc + ` (${pageName})`) : pageName;
        let str_menu = this.templateBusiness.getMenuStr(folderPath, pageName, menuName);
        let compUrl = base_app + '/framework/menu-panel/menu-panel.component.ts';
        let tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        let readStream = fs_1.createReadStream(compUrl);
        let writeStream = fs_1.createWriteStream(tmp_path);
        let readLine = readline_1.createInterface({
            input: readStream,
            output: writeStream
        });
        readLine.on('line', (line) => {
            if (line.indexOf('include_start') != -1) {
                writeStream.write(line + os_1.EOL);
                writeStream.write('        // ----block_start_' + pageName + '----' + os_1.EOL);
                writeStream.write(str_menu + os_1.EOL);
                writeStream.write('        // ----block_end_' + pageName + '----' + os_1.EOL);
                writeStream.write(os_1.EOL);
            }
            else {
                writeStream.write(line + os_1.EOL);
            }
        });
        readLine.on('close', () => {
            setTimeout(() => {
                let data = fs_1.readFileSync(tmp_path, { encoding: 'utf-8' });
                fs_1.writeFileSync(compUrl, data);
            }, 1000);
        });
    }
}
exports.ConchFile = ConchFile;
//# sourceMappingURL=conch-file.js.map