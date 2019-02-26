import {ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {StageService} from './stage.service';
import {StageCommService} from './stage-comm.service';
import {NzDropdownService, NzMenuItemDirective, NzMessageService} from 'ng-zorro-antd';

@Component({
    selector: 'app-stage',
    templateUrl: './stage.component.html',
    styleUrls: ['./stage.component.css']
})
export class StageComponent implements OnInit {

    @ViewChild('treeCom') treeCom; // 图层
    @ViewChild('treeCom2') treeCom2; // 组件浏览

    rightMenuPanel: any; // 右键菜单代表的对象

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    controlPanel: any = false; // 控制台开关

    compTypeTree: any = [{
        title: '组件分类',
        key: 'root',
        icon: 'anticon anticon-setting',
        isLeaf: false,
        expanded: true,
        children: [{
            title: '全部',
            key: 'all',
            icon: 'anticon anticon-setting',
            isLeaf: true,
            expanded: true,
            children: []
        }, {
            title: '布局',
            key: 'layout',
            icon: 'anticon anticon-setting',
            isLeaf: true,
            expanded: true,
            children: []
        }, {
            title: '基础',
            key: 'basic',
            icon: 'anticon anticon-setting',
            isLeaf: true,
            expanded: true,
            children: []
        }, {
            title: '其他',
            key: 'other',
            icon: 'anticon anticon-setting',
            isLeaf: true,
            expanded: true,
            children: []
        }],
    }];

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {

        const that = this;
        const electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-close-project') {
                that.scs.leftPanelActive = 'blank';
            }
        });

        this.scs.cmc$.subscribe((data: any) => {

            if (data.msg == 'msg-choose-conch') {
                const conchObj = data.paramObj;
                that.setTreeNodeRecu(that.treeCom.nzNodes[0], conchObj.conchId);
            }
        });

    }

    setTreeNodeRecu(curNode: any, key: any) {
        if (curNode.key == key) {
            curNode.isSelected = true;
        } else {
            curNode.isSelected = false;
        }
        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const child = curNode.children[i];
                this.setTreeNodeRecu(child, key);
            }
        }
    }

    ngOnInit() {
        const that = this;
    }

    chooseSchemaNode(event: any) {

        const key = event.node.key;

        const tmpCompCode = event.node.origin.comp_code;
        let isLayout = false;
        if (tmpCompCode == 'LayoutRow' || tmpCompCode == 'LayoutColumn') {
            isLayout = true;
        }

        const conchObj = {
            conchId: key,
            isLayout: isLayout
        };

        this.setTreeNodeRecu(this.treeCom.nzNodes[0], conchObj.conchId);

        this.scs.cmcEmitter('msg-choose-in-layer', conchObj);
    }

    chooseLeftPanel(type: any) {
        this.scs.leftPanelActive = type;
        this.scs.clpEmitter(type);
    }

// ===============================

    savePage() {

        const that = this;

        that.scs.curPage.page_schema = JSON.stringify(that.scs.pageSchema[0]);

        const pageVO = JSON.parse(JSON.stringify(that.scs.curPage));
        pageVO.base_app = this.scs.curProject.root_path + '/src/app';
        pageVO.root_path = this.scs.curProject.root_path;

        this.scs.ipcRequest('ipc-update-page-schema', pageVO, (event: any, response: any) => {
            console.log('ipc-update-page-schema-bak');
            if (response) {

                that.zone.run(() => {
                    that.message.create('success', `保存成功`);
                });

            }
        });
    }

    // 在图层中拖动响应方法
    dropInPageSchema(event) {
        const curKey = event.dragNode.key;
        const parentItem = this.scs.schemaMapPage[event.dragNode.origin.parentId];

        let curIndex;
        for (let i = 0; i < parentItem.children.length; i++) {
            const tmpItem = parentItem.children[i];

            if (tmpItem.key == curKey) {
                curIndex = i;
            }
        }

        if (curIndex != null) {
            parentItem.children.splice(curIndex, 1);
        }

        this.scs.cmEmitter('msg-refresh-root-dom');
    }

    getResourcePath() {

        const that = this;
        this.scs.ipcRequest('ipc-get-resource-path', null, (event: any, response: any) => {
            console.log('ipc-get-resource-path-bak');
            if (response) {
                that.zone.run(() => {
                    let str = '';
                    for (let i = 0; i < response.data.list.length; i++) {
                        const listElement = response.data.list[i];
                        str += listElement + '<br/>';
                    }
                    that.message.create('success', str);
                });
            }
        });
    }

    dropDownClick(event: NzMenuItemDirective): void {

        const command = event['hostElement'].nativeElement.innerText;

        if (command == '删除') {
            this.scs.cmEmitter('msg-remove-item');
        } else if (command == '另存为') {
            this.scs.cmEmitter('msg-add-block');
        }

        this.rightMenuPanel.close();
    }

    rightClickNode(event: any, template: any) {

        const that = this;

        this.chooseSchemaNode(event);

        this.rightMenuPanel = this.nzDropdownService.create(event.event, template);

    }
}
