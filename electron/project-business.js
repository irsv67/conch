"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const template_business_1 = require("./const/template-business");
const gen_file_service_1 = require("./const/gen-file.service");
const conch_dao_1 = require("./const/conch-dao");
const conch_file_1 = require("./service/conch-file");
const const_1 = require("./const/const");
class ProjectBusiness {
    constructor() {
        this.conchDao = new conch_dao_1.ConchDao();
        this.conchFile = new conch_file_1.ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new template_business_1.TemplateBusiness();
        this.genFileService = new gen_file_service_1.GenFileService();
        this.const = new const_1.Const();
    }
    //=====================================
    updateProjectData(projectObj) {
        if (!projectObj.project_code) {
            let project_code = 'pro_' + this.genCodeFromTime();
            projectObj.project_code = project_code;
        }
        // 检测并创建目录
        let dir_path = this.const.resource_base + '/data_table';
        if (!fs_1.existsSync(dir_path)) {
            fs_1.mkdirSync(dir_path);
        }
        // 检测并读取文件
        let file_path = this.const.home_path + '/ud_project.json';
        let projectList = [];
        if (fs_1.existsSync(file_path)) {
            let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
            projectList = JSON.parse(json_data);
        }
        // 检测并移除现有项目
        let curIndex = -1;
        for (let i = 0; i < projectList.length; i++) {
            const project = projectList[i];
            if (project.project_name == projectObj.project_name && project.root_path == projectObj.root_path) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            projectList.splice(curIndex, 1);
        }
        // 在列表首部加入当前项目
        projectList.splice(0, 0, {
            "project_name": projectObj.project_name,
            "project_code": projectObj.project_code,
            "root_path": projectObj.root_path
        });
        // 写入文件
        fs_1.writeFileSync(file_path, JSON.stringify(projectList));
    }
    getPageSchema(projectObj) {
        // 检测并读取文件
        let file_path = projectObj.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (fs_1.existsSync(file_path)) {
            let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
            pageSchema = JSON.parse(json_data);
        }
        return pageSchema;
    }
    getProjectTree(projectObj) {
        // 检测并读取文件
        let file_path = projectObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (fs_1.existsSync(file_path)) {
            let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        return projectSchema;
    }
    checkProject(projectObj) {
        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!fs_1.existsSync(projectConchPath)) {
            fs_1.mkdirSync(projectConchPath);
        }
        if (!fs_1.existsSync(projectConchPath + '/page_schema.json')) {
            fs_1.writeFileSync(projectConchPath + '/page_schema.json', JSON.stringify({}));
        }
        if (!fs_1.existsSync(projectConchPath + '/project_schema.json')) {
            let obj = {
                "title": projectObj.project_name,
                "key": projectObj.project_name,
                "expanded": true,
                "icon": "anticon anticon-credit-card",
                "children": []
            };
            fs_1.writeFileSync(projectConchPath + '/project_schema.json', JSON.stringify(obj));
        }
        let module_path = projectObj.root_path + '/node_modules';
        let has_modules = false;
        if (fs_1.existsSync(module_path)) {
            has_modules = true;
        }
        let package_path = projectObj.root_path + '/package.json';
        let isConch = false;
        if (fs_1.existsSync(package_path)) {
            let packStr = fs_1.readFileSync(package_path);
            let packObj = JSON.parse(packStr.toString());
            if (packObj.conch) {
                isConch = true;
            }
        }
        return {
            has_modules: has_modules,
            isConch: isConch
        };
    }
    //===========================================
    removeProject(projectObj) {
        // 检测并读取文件
        let file_path = this.const.home_path + '/ud_project.json';
        let projectList = [];
        if (fs_1.existsSync(file_path)) {
            let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
            projectList = JSON.parse(json_data);
        }
        // 检测并移除现有项目
        let curIndex = -1;
        for (let i = 0; i < projectList.length; i++) {
            const project = projectList[i];
            if (project.project_code == projectObj.project_code) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            projectList.splice(curIndex, 1);
        }
        // 写入文件
        fs_1.writeFileSync(file_path, JSON.stringify(projectList));
    }
    createProject(projectObj) {
        let project_code = 'pro_' + this.genCodeFromTime();
        projectObj.project_code = project_code;
        this.genFileService.createProjectFile(projectObj);
        return projectObj;
    }
    getProjectList() {
        if (!fs_1.existsSync(this.const.home_path)) {
            fs_1.mkdirSync(this.const.home_path);
            fs_1.writeFileSync(this.const.home_path + '/ud_project.json', JSON.stringify([]));
            return [];
        }
        let file_path = this.const.home_path + '/ud_project.json';
        let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
        let projectList = JSON.parse(json_data);
        return projectList;
    }
    genCodeFromTime() {
        let date = new Date();
        let code = '' + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds();
        return code;
    }
}
exports.ProjectBusiness = ProjectBusiness;
//# sourceMappingURL=project-business.js.map