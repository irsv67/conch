import { ConchDao } from '../const/conch-dao';
import { createReadStream, createWriteStream, readFileSync, writeFileSync } from 'fs';
import { EOL } from 'os';
import { createInterface } from 'readline';
import { TemplateBusiness } from '../const/template-business';
import { GenFileService } from '../const/gen-file.service';
import { render } from 'ejs';
import { Const } from '../const/const';
var ConchFile = /** @class */ (function () {
    function ConchFile() {
        this.conchDao = new ConchDao();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }
    // 递归拼装html
    ConchFile.prototype.weaveHtmlRecu = function (curNode, compMap, fieldName, keyMap) {
        var index = keyMap[curNode.key];
        var modelObj = {
            model_config: curNode.model_config || {},
            model_data: curNode.model_data_map || {},
            index: index
        };
        var htmlTemp;
        if (!curNode.comp_code) {
            htmlTemp = "<div class=\"RootConch conch-item\" style=\"background-color: rgba(235,237,240,1);\"></div>";
        }
        else if (curNode.comp_code == 'LayoutColumn' || curNode.comp_code == 'LayoutRow') {
            htmlTemp = "<div class=\"" + curNode.comp_code + " " + curNode.comp_code + "_" + index + " conch-item\">";
            htmlTemp += "</div>";
        }
        else {
            var compObj = compMap[curNode.comp_code];
            if (compObj[fieldName]) {
                htmlTemp = "<div class=\"" + curNode.comp_code + "_" + index + " conch-item\">";
                htmlTemp += render(compObj[fieldName], modelObj);
                htmlTemp += "</div>";
            }
        }
        var $ = this.cheerio.load(htmlTemp, {
            decodeEntities: false,
            _useHtmlParser2: true,
            lowerCaseAttributeNames: false
        });
        var root_dom = $.root().children();
        for (var i = 0; i < curNode.children.length; i++) {
            var subNode = curNode.children[i];
            var subDom = this.weaveHtmlRecu(subNode, compMap, fieldName, keyMap);
            root_dom.append(subDom);
        }
        return $.html();
    };
    ConchFile.prototype.weaveStyleRecu = function (curNode, compMap, fieldName, keyMap) {
        var index = keyMap[curNode.key];
        var constStyleConfig = {
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
        var styleObj = Object.assign(constStyleConfig, curNode.style_config) || {};
        // =================
        var styleTemp = "." + curNode.comp_code + "_" + index + " {\r\n";
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
            styleTemp = "\r\n/*-" + curNode.comp_code + "-*/\r\n" + styleTemp;
        }
        for (var i = 0; i < curNode.children.length; i++) {
            var subNode = curNode.children[i];
            var subStyle = this.weaveStyleRecu(subNode, compMap, fieldName, keyMap);
            styleTemp += subStyle;
        }
        return styleTemp;
    };
    ConchFile.prototype.weaveScriptRecu = function (curNode, compMap, fieldName, keyMap) {
        var index = keyMap[curNode.key];
        var modelObj = {
            model_config: curNode.model_config || {},
            model_data: curNode.model_data_map || {},
            index: index
        };
        var scriptTemp = '';
        if (curNode.comp_code && curNode.comp_code != 'LayoutRow' && curNode.comp_code != 'LayoutColumn') {
            var compObj = compMap[curNode.comp_code];
            if (compObj[fieldName]) {
                scriptTemp += render(compObj[fieldName], modelObj);
            }
        }
        if (curNode.comp_code && scriptTemp != '') {
            if (fieldName == 'style_temp') {
                scriptTemp = "\r\n/*-" + curNode.comp_code + "-*/\r\n" + scriptTemp;
            }
            else {
                scriptTemp = "\r\n    // -" + curNode.comp_code + "-\r\n" + scriptTemp;
            }
        }
        for (var i = 0; i < curNode.children.length; i++) {
            var subNode = curNode.children[i];
            var subScript = this.weaveScriptRecu(subNode, compMap, fieldName, keyMap);
            scriptTemp += subScript;
        }
        return scriptTemp;
    };
    // ==================================
    // 植入html代码
    ConchFile.prototype.weaveHtmlAll = function (pageVO, compMap, keyMap) {
        var pageSchemaObj = JSON.parse(pageVO.page_schema);
        var htmlTemp = this.weaveHtmlRecu(pageSchemaObj, compMap, 'html_temp', keyMap);
        var sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.html';
        var file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(file_path);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        var blockFound = false;
        readLine.on('line', function (line) {
            if (line.indexOf('include_start') != -1) {
                blockFound = true;
                writeStream.write(line + EOL);
                writeStream.write(htmlTemp + EOL);
            }
            else if (line.indexOf('include_end') != -1) {
                writeStream.write(line + EOL);
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', function () {
        });
    };
    ConchFile.prototype.weaveInstanceDataRecu = function (curNode, keyMap, instanceObj) {
        if (curNode.comp_code) {
            var index = keyMap[curNode.key];
            curNode.model_config.model_data = curNode.model_data_map || {};
            instanceObj[curNode.comp_code + '_' + index] = curNode.model_config;
        }
        if (curNode.children) {
            for (var i = 0; i < curNode.children.length; i++) {
                var subNode = curNode.children[i];
                this.weaveInstanceDataRecu(subNode, keyMap, instanceObj);
            }
        }
    };
    // 植入script代码
    ConchFile.prototype.weaveScriptAll = function (pageVO, compMap, keyMap) {
        var pageSchemaObj = JSON.parse(pageVO.page_schema);
        var instanceObj = {};
        this.weaveInstanceDataRecu(pageSchemaObj, keyMap, instanceObj);
        var instanceStr = 'instanceHandler: any = ' + JSON.stringify(instanceObj) + ';';
        var temp_data_import = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_import', keyMap);
        var temp_data_attr = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_attr', keyMap);
        var temp_data_func = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_func', keyMap);
        var temp_data_init = this.weaveScriptRecu(pageSchemaObj, compMap, 'script_temp_init', keyMap);
        var sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.ts';
        var file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(file_path);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        var block_found_import = false;
        var block_found_attr = false;
        var block_found_func = false;
        var block_found_init = false;
        readLine.on('line', function (line) {
            if (line.indexOf('script_import_start') != -1) {
                block_found_import = true;
                writeStream.write(line + EOL);
                writeStream.write(temp_data_import + EOL);
            }
            else if (line.indexOf('script_import_end') != -1) {
                writeStream.write(line + EOL);
                block_found_import = false;
            }
            else if (line.indexOf('script_attr_start') != -1) {
                block_found_attr = true;
                writeStream.write(line + EOL);
                writeStream.write(instanceStr + EOL);
                writeStream.write(temp_data_attr + EOL);
            }
            else if (line.indexOf('script_attr_end') != -1) {
                writeStream.write(line + EOL);
                block_found_attr = false;
            }
            else if (line.indexOf('script_func_start') != -1) {
                block_found_func = true;
                writeStream.write(line + EOL);
                writeStream.write(temp_data_func + EOL);
            }
            else if (line.indexOf('script_func_end') != -1) {
                writeStream.write(line + EOL);
                block_found_func = false;
            }
            else if (line.indexOf('script_init_start') != -1) {
                block_found_init = true;
                writeStream.write(line + EOL);
                writeStream.write(temp_data_init + EOL);
            }
            else if (line.indexOf('script_init_end') != -1) {
                writeStream.write(line + EOL);
                block_found_init = false;
            }
            else if (!block_found_import && !block_found_attr && !block_found_func && !block_found_init) {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', function () {
        });
    };
    // 植入style代码
    ConchFile.prototype.weaveStyleAll = function (pageVO, compMap, keyMap) {
        var pageSchemaObj = JSON.parse(pageVO.page_schema);
        var scriptTemp = this.weaveScriptRecu(pageSchemaObj, compMap, 'style_temp', keyMap);
        var styleTemp = this.weaveStyleRecu(pageSchemaObj, compMap, 'style_temp', keyMap);
        var sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.component.css';
        var file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(file_path);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        var blockFound = false;
        readLine.on('line', function (line) {
            if (line.indexOf('include_start') != -1) {
                blockFound = true;
                writeStream.write(line + EOL);
                writeStream.write(styleTemp + EOL);
                writeStream.write(scriptTemp + EOL);
            }
            else if (line.indexOf('include_end') != -1) {
                writeStream.write(line + EOL);
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(file_path, data);
            }, 1000);
        });
        writeStream.on('end', function () {
        });
    };
    // ==================================
    ConchFile.prototype.getBigNameBySmall = function (fileNew) {
        var nameArray = fileNew.split('-');
        var nameAll = '';
        for (var i = 0; i < nameArray.length; i++) {
            var nameItem = nameArray[i];
            var nameNew = nameItem.charAt(0).toUpperCase() + nameItem.substring(1);
            nameAll += nameNew;
        }
        return nameAll;
    };
    // 植入路由代码
    ConchFile.prototype.weaveModule = function (pageVO, fileMap) {
        var that = this;
        var str_import_all = '';
        var str_declare_all = '';
        for (var fileName in fileMap) {
            var upperName = that.getBigNameBySmall(fileName);
            str_import_all += "import {" + upperName + "Component} from './" + fileName + "/" + fileName + ".component';\r\n";
            str_declare_all += upperName + "Component,\r\n";
        }
        var sub_path = '/' + pageVO.page_name + '/' + pageVO.page_name + '.module.ts';
        var file_path = pageVO.base_app + pageVO.folder_path + sub_path;
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(file_path);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        var importIn = false;
        var declareIn = false;
        readLine.on('line', function (line) {
            if (line.indexOf('module_import_start') != -1) {
                importIn = true;
                writeStream.write(line + EOL);
                writeStream.write(str_import_all + EOL);
            }
            else if (line.indexOf('module_declarations_start') != -1) {
                declareIn = true;
                writeStream.write(line + EOL);
                writeStream.write(str_declare_all + EOL);
            }
            else if (line.indexOf('module_import_end') != -1) {
                importIn = false;
                writeStream.write(line + EOL);
            }
            else if (line.indexOf('module_declarations_end') != -1) {
                declareIn = false;
                writeStream.write(line + EOL);
            }
            else if (!importIn && !declareIn) {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(file_path, data);
            }, 1000);
        });
    };
    // ==================================
    // 植入路由代码
    ConchFile.prototype.weaveRouter = function (base_app, folderPath, pageName, pageNameUpper) {
        var str_router = this.templateBusiness.getRouterStr(folderPath, pageName, pageNameUpper);
        var compUrl = base_app + '/app.routing.ts';
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(compUrl);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        readLine.on('line', function (line) {
            if (line.indexOf('include_start') != -1) {
                writeStream.write(line + EOL);
                writeStream.write('    // ----block_start_' + pageName + '----' + EOL);
                writeStream.write(str_router + EOL);
                writeStream.write('    // ----block_end_' + pageName + '----' + EOL);
                writeStream.write(EOL);
            }
            else {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(compUrl, data);
            }, 1000);
        });
    };
    // 删除路由,菜单代码
    ConchFile.prototype.removeItemScript = function (filePath, conchId) {
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(filePath);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        var blockFound = false;
        readLine.on('line', function (line) {
            if (line.indexOf('block_start_' + conchId) != -1) {
                blockFound = true;
            }
            else if (line.indexOf('block_end_' + conchId) != -1) {
                blockFound = false;
            }
            else if (!blockFound) {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(filePath, data);
            }, 1000);
        });
        writeStream.on('end', function () {
        });
    };
    // ==================================
    // 植入菜单代码
    ConchFile.prototype.weaveMenu = function (base_app, folderPath, pageName, pageNameUpper, page_desc) {
        var menuName = page_desc ? (page_desc + (" (" + pageName + ")")) : pageName;
        var str_menu = this.templateBusiness.getMenuStr(folderPath, pageName, menuName);
        var compUrl = base_app + '/framework/menu-panel/menu-panel.component.ts';
        var tmp_path = this.const.runtime_tmp_path + '/' + this.const.guid() + '.tmp';
        var readStream = createReadStream(compUrl);
        var writeStream = createWriteStream(tmp_path);
        var readLine = createInterface({
            input: readStream,
            output: writeStream
        });
        readLine.on('line', function (line) {
            if (line.indexOf('include_start') != -1) {
                writeStream.write(line + EOL);
                writeStream.write('        // ----block_start_' + pageName + '----' + EOL);
                writeStream.write(str_menu + EOL);
                writeStream.write('        // ----block_end_' + pageName + '----' + EOL);
                writeStream.write(EOL);
            }
            else {
                writeStream.write(line + EOL);
            }
        });
        readLine.on('close', function () {
            setTimeout(function () {
                var data = readFileSync(tmp_path, { encoding: 'utf-8' });
                writeFileSync(compUrl, data);
            }, 1000);
        });
    };
    return ConchFile;
}());
export { ConchFile };
//# sourceMappingURL=conch-file.js.map