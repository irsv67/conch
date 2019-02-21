import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { TemplateBusiness } from './const/template-business';
import { GenFileService } from './const/gen-file.service';
import { ConchDao } from './const/conch-dao';
import { ConchFile } from './service/conch-file';
import { Const } from './const/const';
var PageBusiness = /** @class */ (function () {
    function PageBusiness() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }
    PageBusiness.prototype.removeBlock = function (blockObj) {
        var folder_path = this.const.home_path + '/ud_block';
        var file_path = folder_path + '/' + blockObj.block_code + '.json';
        unlinkSync(file_path);
    };
    PageBusiness.prototype.createBlock = function (blockObj) {
        var block_code = 'block_' + this.genCodeFromTime();
        blockObj.block_code = block_code;
        if (!blockObj.block_name) {
            blockObj.block_name = blockObj.block_code;
        }
        // =============================
        var folder_path = this.const.home_path + '/ud_block';
        if (!existsSync(folder_path)) {
            mkdirSync(folder_path);
        }
        var file_path = folder_path + '/' + block_code + '.json';
        // 写入文件
        writeFileSync(file_path, JSON.stringify(blockObj));
        // =============================
        return blockObj;
    };
    PageBusiness.prototype.removePage = function (pageObj) {
        var pageName = pageObj.page_name;
        var folderPath = pageObj.base_app + pageObj.folder_path + '/' + pageName;
        var file_1 = '/' + pageName + '.component.html';
        var file_2 = '/' + pageName + '.component.css';
        var file_3 = '/' + pageName + '.component.ts';
        var file_4 = '/' + pageName + '.module.ts';
        var file_5 = '/' + pageName + '.service.ts';
        var file_6 = '/' + pageName + '.routing.ts';
        if (existsSync(folderPath + file_1)) {
            unlinkSync(folderPath + file_1);
        }
        if (existsSync(folderPath + file_2)) {
            unlinkSync(folderPath + file_2);
        }
        if (existsSync(folderPath + file_3)) {
            unlinkSync(folderPath + file_3);
        }
        if (existsSync(folderPath + file_4)) {
            unlinkSync(folderPath + file_4);
        }
        if (existsSync(folderPath + file_5)) {
            unlinkSync(folderPath + file_5);
        }
        if (existsSync(folderPath + file_6)) {
            unlinkSync(folderPath + file_6);
        }
        this.deleteFolder(folderPath);
        // 移除app.router代码
        var compUrl = pageObj.base_app + '/app.routing.ts';
        this.conchFile.removeItemScript(compUrl, pageName);
        // 移除menu代码
        var compUrl2 = pageObj.base_app + '/framework/menu-panel/menu-panel.component.ts';
        this.conchFile.removeItemScript(compUrl2, pageName);
        // =====================
        // 检测并读取文件
        var file_path = pageObj.root_path + '/_con_pro/project_schema.json';
        var projectSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        var parentNode = this.getParentNodeRecu2(projectSchema, pageObj.page_code);
        var curIndex = -1;
        for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children[i];
            if (child.key == pageObj.page_code) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            parentNode.children.splice(curIndex, 1);
        }
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));
    };
    PageBusiness.prototype.createPage = function (pageObj) {
        pageObj.folder_path = pageObj.folder_path || '';
        var pageName = pageObj.page_name;
        var pageNameUpper = '';
        var tmpArray = pageName.split('-');
        for (var i = 0; i < tmpArray.length; i++) {
            var obj = tmpArray[i];
            pageNameUpper += obj.charAt(0).toUpperCase() + obj.substring(1);
        }
        if (!existsSync(pageObj.base_app + pageObj.folder_path)) {
            mkdirSync(pageObj.base_app + pageObj.folder_path);
        }
        var dir_path = pageObj.base_app + pageObj.folder_path + '/' + pageName;
        if (!existsSync(dir_path)) {
            mkdirSync(dir_path);
        }
        var file_1 = '/' + pageName + '/' + pageName + '.component.html';
        var file_2 = '/' + pageName + '/' + pageName + '.component.css';
        var file_3 = '/' + pageName + '/' + pageName + '.component.ts';
        var file_4 = '/' + pageName + '/' + pageName + '.module.ts';
        var file_5 = '/' + pageName + '/' + pageName + '.service.ts';
        var file_6 = '/' + pageName + '/' + pageName + '.routing.ts';
        var str_1 = this.templateBusiness.getHtmlStr(pageName, pageNameUpper);
        var str_2 = this.templateBusiness.getStyleStr(pageName, pageNameUpper);
        var str_3 = this.templateBusiness.getCompStr(pageName, pageNameUpper);
        var str_4 = this.templateBusiness.getModuleStr(pageName, pageNameUpper);
        var str_5 = this.templateBusiness.getServiceStr(pageName, pageNameUpper);
        var str_6 = this.templateBusiness.getRoutingStr(pageName, pageNameUpper);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_1, str_1);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_2, str_2);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_3, str_3);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_4, str_4);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_5, str_5);
        writeFileSync(pageObj.base_app + pageObj.folder_path + file_6, str_6);
        // ===============================
        this.conchFile.weaveRouter(pageObj.base_app, pageObj.folder_path, pageName, pageNameUpper);
        this.conchFile.weaveMenu(pageObj.base_app, pageObj.folder_path, pageName, pageNameUpper, pageObj.page_desc);
        // ===============================
        var page_code = 'page_' + this.genCodeFromTime();
        pageObj.page_code = page_code;
        // =============更新project_schema================
        // 检测并读取文件
        var file_path = pageObj.root_path + '/_con_pro/project_schema.json';
        var projectSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        var parentNode = this.getParentNodeRecu(projectSchema, pageObj.folder_code);
        parentNode.children.push({
            'title': pageName,
            'key': pageObj.page_code,
            'expanded': true,
            'isLeaf': true,
            'icon': 'anticon anticon-file',
            'children': [],
            'url': "#/" + pageName + "/" + pageName,
            'folder_path': pageObj.folder_path,
            'page_name': pageName,
            'page_code': pageObj.page_code,
            'page_desc': pageObj.page_desc
        });
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));
        // ============更新page_schema=================
        // 检测并读取文件
        var file_path_2 = pageObj.root_path + '/_con_pro/page_schema.json';
        var pageSchema = {};
        if (existsSync(file_path_2)) {
            var json_data = readFileSync(file_path_2, { encoding: 'utf-8' });
            pageSchema = JSON.parse(json_data);
        }
        pageSchema[pageObj.page_code] = {
            'title': pageName,
            'key': 'root-conch',
            'icon': 'anticon anticon-file',
            'isLeaf': false,
            'expanded': true,
            'children': [],
            'style_config': {}
        };
        // 写入文件
        writeFileSync(file_path_2, JSON.stringify(pageSchema));
    };
    PageBusiness.prototype.removeFolder = function (folderObj) {
        var folderPath = folderObj.base_app + folderObj.tmp_path;
        this.deleteFolder(folderPath);
        // 检测并读取文件
        var file_path = folderObj.root_path + '/_con_pro/project_schema.json';
        var projectSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        var parentNode = this.getParentNodeRecu2(projectSchema, folderObj.folder_code);
        var curIndex = -1;
        for (var i = 0; i < parentNode.children.length; i++) {
            var child = parentNode.children[i];
            if (child.key == folderObj.folder_code) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            parentNode.children.splice(curIndex, 1);
        }
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));
    };
    PageBusiness.prototype.createFolder = function (folderObj) {
        folderObj.tmp_path = folderObj.tmp_path || '';
        var folderFullPath = folderObj.base_app + folderObj.tmp_path + '/' + folderObj.folder_name;
        if (!existsSync(folderFullPath)) {
            mkdirSync(folderFullPath);
        }
        var folder_code = 'folder_' + this.genCodeFromTime();
        folderObj.folder_code = folder_code;
        // =============================
        // 检测并读取文件
        var file_path = folderObj.root_path + '/_con_pro/project_schema.json';
        var projectSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        var parentNode = this.getParentNodeRecu(projectSchema, folderObj.parent_code);
        parentNode.children.push({
            'title': folderObj.folder_name,
            'key': folderObj.folder_code,
            'expanded': true,
            'icon': 'anticon anticon-folder',
            'children': []
        });
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectSchema));
    };
    // ====================
    PageBusiness.prototype.getParentNodeRecu2 = function (curNode, cur_code) {
        var retValue;
        if (curNode.children) {
            for (var i = 0; i < curNode.children.length; i++) {
                var subNode = curNode.children[i];
                if (retValue) {
                    break;
                }
                if (subNode.key == cur_code) {
                    retValue = curNode;
                }
                else {
                    retValue = this.getParentNodeRecu2(subNode, cur_code);
                }
            }
        }
        return retValue;
    };
    PageBusiness.prototype.getParentNodeRecu = function (curNode, parent_code) {
        var retValue;
        if (curNode.key == parent_code) {
            retValue = curNode;
        }
        else if (curNode.children) {
            for (var i = 0; i < curNode.children.length; i++) {
                var subNode = curNode.children[i];
                retValue = this.getParentNodeRecu(subNode, parent_code);
                if (retValue) {
                    break;
                }
            }
        }
        return retValue;
    };
    PageBusiness.prototype.deleteFolder = function (path) {
        var that = this;
        var files = [];
        if (existsSync(path)) {
            files = readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + '/' + file;
                if (statSync(curPath).isDirectory()) { // recurse
                    that.deleteFolder(curPath);
                }
                else { // delete file
                    unlinkSync(curPath);
                }
            });
            rmdirSync(path);
        }
    };
    PageBusiness.prototype.genCodeFromTime = function () {
        var date = new Date();
        var code = '' + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds();
        return code;
    };
    return PageBusiness;
}());
export { PageBusiness };
//# sourceMappingURL=page-business.js.map