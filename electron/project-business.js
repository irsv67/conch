import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { TemplateBusiness } from './const/template-business';
import { GenFileService } from './const/gen-file.service';
import { ConchDao } from './const/conch-dao';
import { ConchFile } from './service/conch-file';
import { Const } from './const/const';
var ProjectBusiness = /** @class */ (function () {
    function ProjectBusiness() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');
        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();
    }
    // =====================================
    ProjectBusiness.prototype.updateProjectData = function (projectObj) {
        if (!projectObj.project_code) {
            var project_code = 'pro_' + this.genCodeFromTime();
            projectObj.project_code = project_code;
        }
        // 检测并创建目录
        var dir_path = this.const.resource_base + '/data_table';
        if (!existsSync(dir_path)) {
            mkdirSync(dir_path);
        }
        // 检测并读取文件
        var file_path = this.const.home_path + '/ud_project.json';
        var projectList = [];
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectList = JSON.parse(json_data);
        }
        // 检测并移除现有项目
        var curIndex = -1;
        for (var i = 0; i < projectList.length; i++) {
            var project = projectList[i];
            if (project.project_name == projectObj.project_name && project.root_path == projectObj.root_path) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            projectList.splice(curIndex, 1);
        }
        // 在列表首部加入当前项目
        projectList.splice(0, 0, {
            'project_name': projectObj.project_name,
            'project_code': projectObj.project_code,
            'root_path': projectObj.root_path
        });
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectList));
    };
    ProjectBusiness.prototype.getPageSchema = function (projectObj) {
        // 检测并读取文件
        var file_path = projectObj.root_path + '/_con_pro/page_schema.json';
        var pageSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            pageSchema = JSON.parse(json_data);
        }
        return pageSchema;
    };
    ProjectBusiness.prototype.getProjectTree = function (projectObj) {
        // 检测并读取文件
        var file_path = projectObj.root_path + '/_con_pro/project_schema.json';
        var projectSchema = {};
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectSchema = JSON.parse(json_data);
        }
        return projectSchema;
    };
    ProjectBusiness.prototype.checkProject = function (projectObj) {
        var projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }
        if (!existsSync(projectConchPath + '/page_schema.json')) {
            writeFileSync(projectConchPath + '/page_schema.json', JSON.stringify({}));
        }
        if (!existsSync(projectConchPath + '/project_schema.json')) {
            var obj = {
                'title': projectObj.project_name,
                'key': projectObj.project_name,
                'expanded': true,
                'icon': 'anticon anticon-credit-card',
                'children': []
            };
            writeFileSync(projectConchPath + '/project_schema.json', JSON.stringify(obj));
        }
        var module_path = projectObj.root_path + '/node_modules';
        var has_modules = false;
        if (existsSync(module_path)) {
            has_modules = true;
        }
        var package_path = projectObj.root_path + '/package.json';
        var isConch = false;
        if (existsSync(package_path)) {
            var packStr = readFileSync(package_path);
            var packObj = JSON.parse(packStr.toString());
            if (packObj.conch) {
                isConch = true;
            }
        }
        return {
            has_modules: has_modules,
            isConch: isConch
        };
    };
    // ===========================================
    ProjectBusiness.prototype.removeProject = function (projectObj) {
        // 检测并读取文件
        var file_path = this.const.home_path + '/ud_project.json';
        var projectList = [];
        if (existsSync(file_path)) {
            var json_data = readFileSync(file_path, { encoding: 'utf-8' });
            projectList = JSON.parse(json_data);
        }
        // 检测并移除现有项目
        var curIndex = -1;
        for (var i = 0; i < projectList.length; i++) {
            var project = projectList[i];
            if (project.project_code == projectObj.project_code) {
                curIndex = i;
            }
        }
        if (curIndex >= 0) {
            projectList.splice(curIndex, 1);
        }
        // 写入文件
        writeFileSync(file_path, JSON.stringify(projectList));
    };
    ProjectBusiness.prototype.createProject = function (projectObj) {
        var project_code = 'pro_' + this.genCodeFromTime();
        projectObj.project_code = project_code;
        this.genFileService.createProjectFile(projectObj);
        return projectObj;
    };
    ProjectBusiness.prototype.getProjectList = function () {
        if (!existsSync(this.const.home_path)) {
            mkdirSync(this.const.home_path);
            writeFileSync(this.const.home_path + '/ud_project.json', JSON.stringify([]));
            return [];
        }
        var file_path = this.const.home_path + '/ud_project.json';
        var json_data = readFileSync(file_path, { encoding: 'utf-8' });
        var projectList = JSON.parse(json_data);
        return projectList;
    };
    ProjectBusiness.prototype.genCodeFromTime = function () {
        var date = new Date();
        var code = '' + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds();
        return code;
    };
    return ProjectBusiness;
}());
export { ProjectBusiness };
//# sourceMappingURL=project-business.js.map