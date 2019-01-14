import {ChangeDetectorRef, Component, OnInit, ViewChild, NgZone} from '@angular/core';
import {StageService} from "../stage.service";
import {NzDropdownService, NzMenuItemDirective, NzMessageService, NzNotificationService} from "ng-zorro-antd";
import {StageCommService} from "../stage-comm.service";

@Component({
    selector: 'app-project-panel',
    templateUrl: './project-panel.component.html',
    styleUrls: ['./project-panel.component.css']
})
export class ProjectPanelComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    rightMenuTreeNode: any; // 右键菜单指向的树节点
    rightMenuPanel: any; // 右键菜单代表的对象
    rightMenuPage: any; // 右键菜单代表的页面

    // ===================

    @ViewChild('treeCom') treeCom;

    treeData: any = [];

    folderFormShow: any = false;
    folderObj: any = {};

    pageFormShow: any = false;
    pageObj: any = {};

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private notification: NzNotificationService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

        this.scs.cmc$.subscribe((data: any) => {

            if (data.msg == 'msg-choose-project') {
                let project = data.paramObj;
                that.scs.curProject = project;
                that.queryFolderTree();
                that.getPageSchema();

            }
        });

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-close-project') {
                that.treeData = [];
                that.scs.curProject = null;
            }
        });
    }

    ngOnInit() {
        const that = this;
    }

    // ======================

    queryFolderTree() {
        const that = this;

        this.scs.ipcRequest('ipc-get-project-tree', that.scs.curProject, (event: any, response: any) => {
            console.log('ipc-get-project-tree-bak');
            if (response) {
                that.zone.run(() => {
                    that.treeData = [response.data];
                });
            }
        });
    }

    getPageSchema() {
        const that = this;

        this.scs.ipcRequest('ipc-get-page-schema', that.scs.curProject, (event: any, response: any) => {
            console.log('ipc-get-page-schema-bak');
            if (response) {
                that.scs.schemaSrcMap = response.data;
            }
        });
    }

    createFolder() {
        const that = this;

        if (!this.folderObj.folder_name) {
            this.message.error('名称不能为空');
            return;
        }

        const reg = /^[a-z0-9\-]+$/;
        if (!reg.test(this.folderObj.folder_name)) {
            this.message.error('名称格式为小写字母和数字，可用横线隔开');
            return;
        }

        this.folderObj.base_app = this.scs.curProject.root_path + '/src/app';
        this.folderObj.root_path = this.scs.curProject.root_path;

        this.scs.ipcRequest('ipc-create-folder', this.folderObj, (event: any, response: any) => {
            console.log('ipc-create-folder-bak');
            if (response) {
                that.message.create('success', '创建成功');
                that.folderFormShow = false;
                that.queryFolderTree();
            }
        });
    }

    getFolderPath(curNode: any) {
        if (curNode.parentNode) {
            if (curNode.isLeaf) {
                return this.getFolderPath(curNode.parentNode);
            } else {
                return this.getFolderPath(curNode.parentNode) + '/' + curNode.title;
            }
        } else {
            return '';
        }
    }

    createPage() {
        const that = this;

        if (!this.pageObj.page_name) {
            this.message.error('名称不能为空');
            return;
        }

        const reg = /^[a-z0-9\-]+$/;
        if (!reg.test(this.pageObj.page_name)) {
            this.message.error('名称格式为小写字母和数字，可用横线隔开');
            return;
        }

        this.pageObj.base_app = this.scs.curProject.root_path + '/src/app';
        this.pageObj.root_path = this.scs.curProject.root_path;

        this.scs.ipcRequest('ipc-create-page', this.pageObj, (event: any, response: any) => {
            console.log('ipc-create-page-bak');
            if (response) {
                that.message.create('success', '创建成功');
                that.pageFormShow = false;
                that.queryFolderTree();
                that.getPageSchema();
            }
        });
    }

    chooseTreeNode(event: any) {

        if (event.node.isLeaf) {

            this.scs.curEditTreeNode = event.node;

            this.scs.curPage = event.node.origin;
            this.scs.curDataConch.conchId = '';

            this.scs.cmcEmitter('msg-choose-page', event.node.origin);
        }

    }

    // =====================

    rightClickNode(event: any, template: any) {
        this.rightMenuTreeNode = event.node;
        this.rightMenuPage = event.node.origin;
        this.rightMenuPanel = this.nzDropdownService.create(event.event, template);
    }

    dropDownClick(event: NzMenuItemDirective): void {

        const that = this;

        let command = event['hostElement'].nativeElement.innerText;

        let tmpTreeNode = this.rightMenuTreeNode;

        if (command == '新建目录') {

            if (tmpTreeNode.isLeaf) {
                tmpTreeNode = tmpTreeNode.parentNode;
            }

            let folderPath = this.getFolderPath(tmpTreeNode);

            this.folderObj = {
                name: '',
                parent_code: tmpTreeNode.key,
                project_code: that.scs.curProject.project_code,
                tmp_path: folderPath
            };

            this.folderFormShow = true;
            setTimeout(function () {
                document.getElementById('addFolderFocus').focus();
            })
        } else if (command == '新建页面') {

            if (tmpTreeNode.isLeaf) {
                tmpTreeNode = tmpTreeNode.parentNode;
            }

            let folderPath = this.getFolderPath(tmpTreeNode);

            this.pageObj = {
                page_name: '',
                page_desc: '',
                folder_code: tmpTreeNode.key,
                folder_path: folderPath
            };

            this.pageFormShow = true;
            setTimeout(function () {
                document.getElementById('addPageFocus').focus();
            })
        } else if (command == '删除') {

            if (tmpTreeNode.children.length > 0) {
                this.message.create('warning', '节点不为空，不能删除');
                return;
            }

            if (tmpTreeNode.isLeaf) {
                // 删除页面
                let pageObj = JSON.parse(JSON.stringify(tmpTreeNode.origin));
                pageObj.page_name = this.rightMenuPage.title;
                pageObj.page_code = this.rightMenuPage.key;

                pageObj.base_app = this.scs.curProject.root_path + '/src/app';
                pageObj.root_path = this.scs.curProject.root_path;

                this.scs.ipcRequest('ipc-remove-page', pageObj, (event: any, response: any) => {
                    console.log('ipc-remove-page-bak');
                    if (response) {
                        that.message.create('success', '删除成功');
                        that.queryFolderTree();
                        that.getPageSchema();

                    }
                });

                if (pageObj.page_code == that.rightMenuPage.page_code) {
                    that.scs.mainPanelStatus = 'project-main';
                }

            } else {
                // 删除目录
                let folderPath = this.getFolderPath(tmpTreeNode);

                let body = {
                    folder_code: tmpTreeNode.key,
                    tmp_path: folderPath,
                    base_app: this.scs.curProject.root_path + '/src/app',
                    root_path: this.scs.curProject.root_path
                };

                this.scs.ipcRequest('ipc-remove-folder', body, (event: any, response: any) => {
                    console.log('ipc-remove-folder-bak');
                    if (response) {
                        that.message.create('success', '删除成功');
                        that.queryFolderTree();
                    }
                });
            }

        }
        this.rightMenuPanel.close();
    }
}
