import {ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {StageService} from "../stage.service";
import {NzDropdownService, NzMessageService} from "ng-zorro-antd";
import {StageCommService} from "../stage-comm.service";
import {ConchConfigService} from "../../conch/conch-config.service";

@Component({
    selector: 'app-property-panel',
    templateUrl: './property-panel.component.html',
    styleUrls: ['./property-panel.component.css']
})
export class PropertyPanelComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    blockFormShow: any = false;
    blockName: any;

    constructor(private stageService: StageService,
                public scs: StageCommService,
                public ccs: ConchConfigService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;
    }

    changeWidthAuto(widthAuto: any) {
        if (widthAuto) {
            this.scs.curStyleConch.style_config.width = 'auto';
        } else {
            this.scs.curStyleConch.style_config.width = '100px';
        }
    }

    changeHeightAuto(heightAuto: any) {
        if (heightAuto) {
            this.scs.curStyleConch.style_config.height = 'auto';
        } else {
            this.scs.curStyleConch.style_config.height = '100px';
        }
    }

    ngOnInit() {

        const that = this;

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-remove-item') {
                that.removeItem();
            } else if (msg == 'msg-add-block') {
                that.addBlock();
            }
        });

    }

    //保存当前组件配置到源码
    updateItem() {

        const that = this;

        // 获取model_config的值
        let tmpModelConfigObj: any = {};

        let tmpModelDataMap = {}; // 传递模型数据
        this.scs.curSelectedConch.model_view_list.forEach((viewObj: any) => {
            tmpModelConfigObj[viewObj.field] = viewObj.value;

            // 将select的值对应的数据合并到 tmpModelDataMap
            if (viewObj.view_type == 'select') {
                if (viewObj.data_src == 'model') { // 传递模型数据
                    for (let i = 0; i < viewObj.selectList.length; i++) {
                        const selectItem = viewObj.selectList[i];
                        if (selectItem.model_code == viewObj.value) {
                            let configObj = JSON.parse(selectItem.model_data);
                            Object.assign(tmpModelDataMap, configObj);
                        }
                    }
                }
            }
        });

        let tmpModelKeyMap = {}; // 存储原装配置中所有模型字段的key和value
        this.scs.curSelectedConch.model_view_list.forEach((viewObj: any) => {
            if (viewObj.view_type == 'select') { // 视图类型是下拉框
                if (viewObj.data_src == 'model') { // 下拉取值来源是模型
                    let tmpValue = tmpModelConfigObj[viewObj.field];
                    tmpModelKeyMap[viewObj.field] = tmpValue;
                }
            }
        });

        // 将model_config的值更新到schema
        let schemaItem = that.scs.schemaMapPage[that.scs.curDataConch.conchId];
        schemaItem.model_config = tmpModelConfigObj;
        schemaItem.style_config = this.scs.curStyleConch.style_config;
        schemaItem.model_key_map = tmpModelKeyMap;

        schemaItem.model_data_map = tmpModelDataMap;

//======================

        let constStyleConfig: any = {
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

        Object.assign(constStyleConfig, schemaItem.style_config);

        let styleObj = Object.assign(constStyleConfig, schemaItem.style_config) || {};

        let styleNew = {
            width: styleObj.width,
            height: styleObj.height,
            flex: styleObj.flex,

            margin: styleObj.marginTop + 'px ' + styleObj.marginRight + 'px ' + styleObj.marginBottom + 'px ' + styleObj.marginLeft + 'px',
            padding: styleObj.paddingTop + 'px ' + styleObj.paddingRight + 'px ' + styleObj.paddingBottom + 'px ' + styleObj.paddingLeft + 'px',

            background: styleObj.background,
            'border-radius': styleObj.borderRadius,
            'box-shadow': styleObj.boxShadow ? '0 1px 2px 0 rgba(23, 35, 61, 0.15)' : '',
        };

        schemaItem.styleNew = styleNew;
//======================

        that.scs.cmEmitter('msg-hide-select-rect');

        // 处理dom
        that.scs.cmEmitter('msg-refresh-root-dom');
    }

    //删除选中组件
    removeItem() {

        const that = this;

        let schemaItem = that.scs.schemaMapPage[this.scs.curDataConch.conchId];
        let parentSchema = that.scs.schemaMapPage[schemaItem.parentId];

        // 检索schema，删除节点
        let childIndex;
        for (let i = 0; i < parentSchema.children.length; i++) {
            const child = parentSchema.children[i];
            if (child.key == this.scs.curDataConch.conchId) {
                childIndex = i;
            }
        }
        if (childIndex != null) {
            parentSchema.children.splice(childIndex, 1);

            that.scs.pageSchema = JSON.parse(JSON.stringify(that.scs.pageSchema));
            that.scs.pickPageSchemaItem(that.scs.pageSchema[0]);

            that.changeDetectorRef.markForCheck();
            that.changeDetectorRef.detectChanges();
        }

        this.scs.curDataConch.conchId = '';

        // 处理dom
        that.scs.cmEmitter('msg-refresh-root-dom');

    }

    addBlock() {
        this.blockFormShow = true;
        this.blockName = '';
        setTimeout(function () {
            document.getElementById('addBlockFocus').focus();
        })
    }

    createBlock() {
        const that = this;

        this.blockName = this.blockName.trim();

        if (!this.blockName) {
            this.message.error('名称不能为空');
            return;
        }

        const reg = /^[A-Za-z0-9\u4e00-\u9fa5\-_]+$/;
        if (!reg.test(this.blockName)) {
            this.message.error('名称不能含有特殊字符');
            return;
        }

        let schemaItem = that.scs.schemaMapPage[that.scs.curDataConch.conchId];
        let blockObj = {
            block_name: this.blockName,
            block_schema: JSON.stringify(schemaItem)
        };

        this.scs.ipcRequest('ipc-create-block', blockObj, (event: any, response: any) => {
            console.log('ipc-create-block-bak');
            if (response) {
                that.message.create('success', '创建成功');
                that.blockFormShow = false;

                that.scs.cmEmitter('msg-query-block');
            }
        });
    }

}
