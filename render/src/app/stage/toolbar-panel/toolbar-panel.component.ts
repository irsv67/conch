import {Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, NgZone} from '@angular/core';
import {StageService} from "../stage.service";
import {StageCommService} from "../stage-comm.service";
import {NzDropdownService, NzMessageService, NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-toolbar-panel',
    templateUrl: './toolbar-panel.component.html',
    styleUrls: ['./toolbar-panel.component.css']
})
export class ToolbarPanelComponent implements OnInit {

    curChoosePagePath: any; // 页面路径

    @Input() stateObj: any = {
        stateMessage: null,
        stateIcon: 'closed',
        errorMessage: null
    };

    errorPanelShow: any = false;

    @Output() savePageEmitter = new EventEmitter<any>();

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    loadingFormShow: any = false; // 加载状态，模态框

    addProjectFormShow: any = false;

    projectObj: any = {};

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private notification: NzNotificationService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

        this.scs.cmc$.subscribe((data: any) => {

            if (data.msg == 'msg-choose-project') {
                let project = data.paramObj;

                that.curChoosePagePath = null;

                // 向后台发送消息，初始化表格数据
                // 检测项目状态，确定是否需要安装依赖

                this.scs.ipcRequest('ipc-check-project', project, (event: any, response: any) => {
                    console.log('ipc-check-project-bak');
                    if (response.status == 'success') {
                        that.scs.isConch = response.data.isConch;
                        if (that.scs.isConch) {
                            that.scs.leftPanelActive = 'project';
                        } else {
                            that.scs.leftPanelActive = 'router-module';
                        }
                        if (response.data.has_modules) {
//                        setTimeout(function () {
//                            that.buildWatch();
//                        }, 1000);
                        } else {
//                        setTimeout(function () {
//                            that.unzipDependencies();
//                        }, 1000);
                        }
                    }
                });

                this.scs.ipcRequest('ipc-update-project-data', project, (event: any, response: any) => {
                    console.log('ipc-update-project-data-bak');
                    if (response.status == 'success') {
                        that.queryProject();
                    }
                });

            } else if (data.msg == 'msg-choose-page') {
                let pageParam = data.paramObj;
                that.curChoosePagePath = that.scs.curProject.project_name + '' + pageParam.folder_path + '/' + pageParam.page_name;
            }
        });

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-remove-project') {
                that.queryProject();
            }
        });
    }

    ngOnInit() {

        const that = this;

        this.queryProject();

    }

    openProjectFolder() {
        this.shell.showItemInFolder(this.scs.curProject.root_path + '/package.json');
    }

    savePage() {
        this.savePageEmitter.emit();
    }

    changeViewStatus() {

//        this.startServe();

        if (this.scs.curProject && this.scs.curProject.project_name && this.scs.curPage && this.scs.curPage.url) {
            let url = 'http://localhost:8080/' + this.scs.curProject.project_name + '/' + this.scs.curPage.url;
            this.shell.openExternal(url);
        }
    }

    // ======================

    openProject() {
        const that = this;

        this.scs.ipcRequest('ipc-open-project', null, (event: any, param: any) => {
            console.log('ipc-open-project-bak');
            if (param.status == 'success') {
                let projectObj = {
                    project_name: param.project_name,
                    root_path: param.root_path.replace(/\\/g, '/')
                };
                that.scs.cmcEmitter('msg-choose-project', projectObj);
            }
        });
    }

    queryProject() {
        const that = this;

        this.scs.ipcRequest('ipc-get-project-list', null, (event: any, response: any) => {
            console.log('ipc-get-project-list-bak');
            if (response.status == 'success') {
                that.zone.run(() => {
                    that.scs.projectList = response.data;
                });
            } else {
                that.notification.create('error', 'error', response.msg);
            }
        });
    }

    chooseProject(project: any) {
        this.scs.cmcEmitter('msg-choose-project', project);
    }

    addProject(): void {
        this.projectObj = {};
        this.addProjectFormShow = true;

        setTimeout(function () {
            document.getElementById('addProjectFocus').focus();
        })
    }

    createProject(): void {
        const that = this;

        let prefix = '/';
        if (this.projectObj.root_folder.endsWith('/')) {
            prefix = '';
        }

        this.projectObj.root_path = this.projectObj.root_folder + prefix + this.projectObj.project_name;

        this.scs.ipcRequest('ipc-create-project', this.projectObj, (event: any, response: any) => {
            console.log('ipc-create-project-bak');
            if (response.status == 'success') {
                that.scs.cmcEmitter('msg-choose-project', response.data);
                that.addProjectFormShow = false;
            }
        });
    }

    closeProject() {
        this.scs.cmEmitter('msg-close-project');
    }

    chooseDistFolder() {
        const that = this;

        this.scs.ipcRequest('ipc-choose-disk-folder', null, (event: any, path: any) => {
            console.log('ipc-choose-disk-folder-bak');
            console.log(path[0]);
            if (path && path.length > 0) {
                that.zone.run(() => {
                    that.projectObj.root_folder = path[0].replace(/\\/g, '/');
                });
            }
        });

    }

}
