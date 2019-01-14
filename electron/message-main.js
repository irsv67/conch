"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } = require('electron');
const os = require('os');
const fs_1 = require("fs");
const project_business_1 = require("./project-business");
const stage_business_1 = require("./stage-business");
const page_business_1 = require("./page-business");
const control_business_1 = require("./control-business");
const const_1 = require("./const/const");
class MessageMain {
    constructor() {
        this.projectBusiness = new project_business_1.ProjectBusiness();
        this.stageBusiness = new stage_business_1.StageBusiness();
        this.pageBusiness = new page_business_1.PageBusiness();
        this.controlBusiness = new control_business_1.ControlBusiness();
        this.const = new const_1.Const();
        if (!fs_1.existsSync(this.const.resource_base)) {
            fs_1.mkdirSync(this.const.resource_base);
        }
        if (!fs_1.existsSync(this.const.home_path)) {
            fs_1.mkdirSync(this.const.home_path);
        }
        if (!fs_1.existsSync(this.const.runtime_tmp_path)) {
            fs_1.mkdirSync(this.const.runtime_tmp_path);
        }
        if (!fs_1.existsSync(this.const.home_path + '/ud_project.json')) {
            fs_1.writeFileSync(this.const.home_path + '/ud_project.json', JSON.stringify([]));
        }
    }
    init() {
        const that = this;
        ipcMain.on('ipc-sync-table', (event, paramObj) => {
            that.stageBusiness.syncTable(paramObj);
            event.sender.send('ipc-sync-table-back', {
                status: "success",
            });
        });
        //=================================
        ipcMain.on('ipc-scan-sub-comp', (event, projectObj) => {
            let treeData = that.controlBusiness.scanSubComp(projectObj);
            event.sender.send('ipc-scan-sub-comp-back', {
                status: "success",
                data: treeData
            });
        });
        ipcMain.on('ipc-scan-routing', (event, projectObj) => {
            let curNodeFolder = that.controlBusiness.scanRouting(projectObj);
            event.sender.send('ipc-scan-routing-back', {
                status: "success",
                data: curNodeFolder
            });
        });
        //---------------------------------
        ipcMain.on('ipc-get-comp-dom-list', (event, compType) => {
            let compDom = that.controlBusiness.getCompDomList(compType);
            event.sender.send('ipc-get-comp-dom-list-back', {
                status: "success",
                data: compDom
            });
        });
        //=================================
        ipcMain.on('ipc-remove-block', (event, blockObj) => {
            that.pageBusiness.removeBlock(blockObj);
            event.sender.send('ipc-remove-block-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-create-block', (event, blockObj) => {
            that.pageBusiness.createBlock(blockObj);
            event.sender.send('ipc-create-block-back', {
                status: "success",
            });
        });
        //---------------------------------
        ipcMain.on('ipc-remove-page', (event, pageObj) => {
            that.pageBusiness.removePage(pageObj);
            event.sender.send('ipc-remove-page-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-create-page', (event, pageObj) => {
            that.pageBusiness.createPage(pageObj);
            event.sender.send('ipc-create-page-back', {
                status: "success",
            });
        });
        //---------------------------------
        ipcMain.on('ipc-remove-folder', (event, folderObj) => {
            that.pageBusiness.removeFolder(folderObj);
            event.sender.send('ipc-remove-folder-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-create-folder', (event, folderObj) => {
            that.pageBusiness.createFolder(folderObj);
            event.sender.send('ipc-create-folder-back', {
                status: "success",
            });
        });
        //=================================
        ipcMain.on('ipc-query-block-all', (event, tableName) => {
            let rows = that.stageBusiness.queryBlockAll();
            event.sender.send('ipc-query-block-all-back', {
                status: "success",
                data: rows
            });
        });
        ipcMain.on('ipc-update-page-schema', (event, pageVO) => {
            that.stageBusiness.updatePageSchema(pageVO);
            event.sender.send('ipc-update-page-schema-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-query-comp-all', (event, project) => {
            let compList = that.stageBusiness.queryCompAll();
            event.sender.send('ipc-query-comp-all-back', {
                status: "success",
                data: compList
            });
        });
        ipcMain.on('ipc-query-model-all', (event, project) => {
            let modelList = that.stageBusiness.queryModelAll();
            event.sender.send('ipc-query-model-all-back', {
                status: "success",
                data: modelList
            });
        });
        ipcMain.on('ipc-query-demo-data-all', (event, project) => {
            let demoDataList = that.stageBusiness.queryDemoDataAll();
            event.sender.send('ipc-query-demo-data-all-back', {
                status: "success",
                data: demoDataList
            });
        });
        //        queryDemoDataAll
        //=================================
        ipcMain.on('ipc-update-project-data', (event, project) => {
            that.projectBusiness.updateProjectData(project);
            event.sender.send('ipc-update-project-data-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-get-page-schema', (event, project) => {
            let pageSchema = that.projectBusiness.getPageSchema(project);
            event.sender.send('ipc-get-page-schema-back', {
                status: "success",
                data: pageSchema
            });
        });
        ipcMain.on('ipc-get-project-tree', (event, project) => {
            let projectSchema = that.projectBusiness.getProjectTree(project);
            event.sender.send('ipc-get-project-tree-back', {
                status: "success",
                data: projectSchema
            });
        });
        ipcMain.on('ipc-check-project', (event, project) => {
            let retObj = that.projectBusiness.checkProject(project);
            // 需要在checkProject后执行，因为要初始化目录和文件
            that.controlBusiness.scanProject(project);
            event.sender.send('ipc-check-project-back', {
                status: "success",
                data: retObj
            });
        });
        //---------------------------------
        ipcMain.on('ipc-remove-project', (event, project) => {
            that.projectBusiness.removeProject(project);
            event.sender.send('ipc-remove-project-back', {
                status: "success",
            });
        });
        ipcMain.on('ipc-create-project', (event, project) => {
            let projectObj = that.projectBusiness.createProject(project);
            event.sender.send('ipc-create-project-back', {
                status: "success",
                data: projectObj
            });
        });
        ipcMain.on('ipc-get-project-list', (event, project) => {
            let projectList = that.projectBusiness.getProjectList();
            event.sender.send('ipc-get-project-list-back', {
                status: "success",
                data: projectList
            });
        });
        //---------------------------------
        ipcMain.on('ipc-choose-disk-folder', (event) => {
            dialog.showOpenDialog({
                properties: ['openFile', 'openDirectory']
            }, (files) => {
                if (files) {
                    event.sender.send('ipc-choose-disk-folder-back', files);
                }
            });
        });
        ipcMain.on('ipc-open-project', (event) => {
            dialog.showOpenDialog({
                properties: ['openFile', 'openDirectory']
            }, (files) => {
                let retObj;
                if (files && files.length > 0) {
                    let file_path = files[0] + '/package.json';
                    let packageSchema = {};
                    if (fs_1.existsSync(file_path)) {
                        let json_data = fs_1.readFileSync(file_path, { encoding: 'utf-8' });
                        packageSchema = JSON.parse(json_data);
                    }
                    if (packageSchema.name) {
                        retObj = {
                            project_name: packageSchema.name,
                            root_path: files[0],
                            status: 'success'
                        };
                    }
                }
                if (!retObj) {
                    retObj = { status: 'error' };
                }
                event.sender.send('ipc-open-project-back', retObj);
            });
        });
        ipcMain.on('ipc-get-resource-path', (event) => {
            let files = fs_1.readdirSync(os.homedir());
            let list = [];
            files.forEach(function (file, index) {
                list.push(file);
            });
            event.sender.send('ipc-get-resource-path-back', { status: 'success', data: { list: list } });
        });
    }
}
exports.MessageMain = MessageMain;
//# sourceMappingURL=message-main.js.map