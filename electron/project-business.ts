import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmdirSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "fs";
import {TemplateBusiness} from "./const/template-business";
import {GenFileService} from "./const/gen-file.service";
import {ConchDao} from "./const/conch-dao";
import {ConchFile} from "./service/conch-file";
import {Const} from "./const/const";

export class ProjectBusiness {

    conchDao: ConchDao;
    conchFile: ConchFile;
    cheerio: any;

    templateBusiness: TemplateBusiness;
    genFileService: GenFileService;
    const: Const;

    constructor() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');

        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();

    }

    //=====================================

    updateProjectData(projectObj) {

        if (!projectObj.project_code) {
            let project_code = 'pro_' + this.genCodeFromTime();
            projectObj.project_code = project_code;
        }

        // 检测并创建目录
        let dir_path = this.const.resource_base + '/data_table';
        if (!existsSync(dir_path)) {
            mkdirSync(dir_path);
        }

        // 检测并读取文件
        let file_path = this.const.home_path + '/ud_project.json';
        let projectList = [];
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
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
        writeFileSync(file_path, JSON.stringify(projectList));

    }

    getPageSchema(projectObj) {
        // 检测并读取文件
        let file_path = projectObj.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            pageSchema = JSON.parse(json_data);
        }

        return pageSchema;

    }

    getProjectTree(projectObj) {
        // 检测并读取文件
        let file_path = projectObj.root_path + '/_con_pro/project_schema.json';
        let projectSchema = {};
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
            projectSchema = JSON.parse(json_data);
        }

        return projectSchema;
    }

    checkProject(projectObj) {

        let projectConchPath = projectObj.root_path + '/_con_pro';
        if (!existsSync(projectConchPath)) {
            mkdirSync(projectConchPath);
        }

        if (!existsSync(projectConchPath + '/page_schema.json')) {
            writeFileSync(projectConchPath + '/page_schema.json', JSON.stringify({}));
        }

        if (!existsSync(projectConchPath + '/project_schema.json')) {
            let obj = {
                "title": projectObj.project_name,
                "key": projectObj.project_name,
                "expanded": true,
                "icon": "anticon anticon-credit-card",
                "children": []
            };
            writeFileSync(projectConchPath + '/project_schema.json', JSON.stringify(obj));
        }

        let module_path = projectObj.root_path + '/node_modules';
        let has_modules = false;
        if (existsSync(module_path)) {
            has_modules = true;
        }

        let package_path = projectObj.root_path + '/package.json';
        let isConch = false;
        if (existsSync(package_path)) {
            let packStr: Buffer = readFileSync(package_path);
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
        if (existsSync(file_path)) {
            let json_data = readFileSync(file_path, {encoding: 'utf-8'});
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
        writeFileSync(file_path, JSON.stringify(projectList));

    }

    createProject(projectObj) {

        let project_code = 'pro_' + this.genCodeFromTime();
        projectObj.project_code = project_code;

        this.genFileService.createProjectFile(projectObj);

        return projectObj;
    }

    getProjectList() {

        if (!existsSync(this.const.home_path)) {
            mkdirSync(this.const.home_path);
            writeFileSync(this.const.home_path + '/ud_project.json', JSON.stringify([]));
            return [];
        }

        let file_path = this.const.home_path + '/ud_project.json';
        let json_data = readFileSync(file_path, {encoding: 'utf-8'});
        let projectList = JSON.parse(json_data);

        return projectList;
    }

    private genCodeFromTime() {
        let date = new Date();
        let code = '' + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds();
        return code;
    }

}