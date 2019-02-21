import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChildren,
    ViewChild
} from '@angular/core';
import {StageService} from "../stage.service";
import {StageCommService} from "../stage-comm.service";
import {NzDropdownService, NzMenuItemDirective, NzMessageService} from "ng-zorro-antd";
import {ConchConfigService} from "../../conch/conch-config.service";

import {ReceptorDirective} from "../common/receptor.directive";
import {RecuTemplateComponent} from "../common/recu-template/recu-template.component";

@Component({
    selector: 'app-center-panel',
    templateUrl: './center-panel.component.html',
    styleUrls: ['./center-panel.component.css']
})
export class CenterPanelComponent implements OnInit {

    option: any = {
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
        }]
    };

    //============

    @ViewChild('treeCom') treeCom;
    @ViewChild('contextMenuTemp') contextMenuTemp;

    @ViewChild('templateKeeper') templateKeeper;

    // @ViewChildren(TransmitterDirective) transmitterList: QueryList<TemplateRef<string>>;
    @ViewChildren(ReceptorDirective) receptorList: QueryList<ReceptorDirective>;

    @ViewChildren('subInstance') subInstanceList: QueryList<RecuTemplateComponent>;
    //============

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    curDragoverElement: any;

    rightMenuPanel: any; // 右键菜单代表的对象

    constructor(private stageService: StageService,
                public scs: StageCommService,
                public ccs: ConchConfigService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

        this.scs.cmc$.subscribe((data: any) => {
            if (data.msg == 'msg-choose-project') {
                that.scs.mainPanelStatus = 'project-main';

                that.changeDetectorRef.markForCheck();
                that.changeDetectorRef.detectChanges();
            } else if (data.msg == 'msg-choose-page') {
                let pageObj = data.paramObj;

                that.scs.pageSchema = [that.scs.schemaSrcMap[pageObj.page_code]];
                that.scs.pickPageSchemaItem(that.scs.pageSchema[0]);

                that.scs.cmEmitter('msg-refresh-root-dom');

                that.scs.mainPanelStatus = 'page';
                that.hideSelectRect();
            }
        });

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-close-project') {
                that.scs.mainPanelStatus = 'blank';

                that.scs.curDataConch.conchId = '';

                that.changeDetectorRef.markForCheck();
                that.changeDetectorRef.detectChanges();
            }
        });

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-hide-select-rect') {
                that.hideSelectRect();
            } else if (msg == 'msg-refresh-root-dom') {
                that.refreshRootDom();
            }
        });

        // chooseInLayer
        this.scs.cmc$.subscribe((data: any) => {

            if (data.msg == 'msg-choose-in-layer') {
                let conchObj = data.paramObj;

                let elements = document.getElementsByClassName('conch-item');
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];

                    let attrMap = this.getAttrMapFromElement(element);
                    if (attrMap['id'] == conchObj.conchId) {
                        that.scs.curDataConch.conchId = conchObj.conchId;
                        that.scs.curDataConch.isLayout = conchObj.isLayout;

                        that.resetSelectRect(element);
                        that.resetPropertyData();
                    }
                }
            }
        });

        //=============================
    }

    walkSchemaForTemp(curNode: any) {

        if (curNode.comp_code && curNode.comp_code != 'LayoutColumn' && curNode.comp_code != 'LayoutRow') {
            if (this.ccs.instanceHandler[curNode.comp_code] == null) {
                this.ccs.instanceHandler[curNode.comp_code] = [];
            }

            let objOrigin = JSON.parse(JSON.stringify(this.ccs.compConfigMap[curNode.comp_code].model_config || {}));
            let tmpModelConfig = Object.assign(objOrigin, curNode.model_config || {});

            let tmpModelValueMap = {};
            let tmpModelDataMap = {};
            if (curNode.model_key_map) {
                for (let key in curNode.model_key_map) {
                    tmpModelValueMap[key] = this.scs.demoDataMap[curNode.model_key_map[key]];

                    let modelObj = this.scs.modelCodeMap[curNode.model_key_map[key]];
                    if (modelObj) {
                        tmpModelDataMap[key] = JSON.parse(modelObj.model_data);
                    }
                }
            }

            let obj = {
                key: curNode.key,
                model_config: tmpModelConfig,
                model_value_map: tmpModelValueMap,
                model_data_map: tmpModelDataMap
            };

            this.ccs.instanceHandler[curNode.comp_code].push(obj);
        }

        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const child = curNode.children[i];
                this.walkSchemaForTemp(child);
            }
        }
    }

    refreshRootDom() {

        const that = this;

        that.hideSelectRect();

        this.ccs.instanceHandler = {};
        this.walkSchemaForTemp(this.scs.pageSchema[0]);

        setTimeout(() => {
            let transmitterMap = {};
            that.templateKeeper.transmitterList.forEach((item: any) => {
                if (item.name) {
                    transmitterMap[item.name + '-' + item.index] = item;
                }
            });

            let nameMap = {};

            //================

            that.subInstanceList.forEach((item: RecuTemplateComponent) => {
                that.clearTemplateRecu(item);
            });

            that.subInstanceList.forEach((item: RecuTemplateComponent) => {
                that.renderTemplateRecu(item, transmitterMap, nameMap);
            });

            //================

            // that.receptorList.forEach((item: any) => {
            //     let viewContainerRef = item.viewContainerRef;
            //     viewContainerRef.clear();
            // });
            //
            // that.receptorList.forEach((item: any) => {
            //     let viewContainerRef = item.viewContainerRef;
            //     if (nameMap[item.name] == null) {
            //         nameMap[item.name] = 0;
            //     } else {
            //         nameMap[item.name] = nameMap[item.name] + 1;
            //     }
            //     let nameWithCount = item.name + '-' + nameMap[item.name];
            //     let templateRef = transmitterMap[nameWithCount].templateRef;
            //     viewContainerRef.createEmbeddedView(templateRef);
            // });

            that.bindAllEleEvents();

        })

    };

    clearTemplateRecu(curNode: RecuTemplateComponent) {
        let that = this;
        if (curNode.receptorList) {
            curNode.receptorList.forEach((item: ReceptorDirective) => {
                let viewContainerRef = item.viewContainerRef;
                viewContainerRef.clear();
            });

        }
        if (curNode.subInstanceList) {
            curNode.subInstanceList.forEach((item: RecuTemplateComponent) => {
                that.clearTemplateRecu(item);
            });
        }
    }

    renderTemplateRecu(curNode: RecuTemplateComponent, transmitterMap, nameMap) {
        let that = this;
        if (curNode.receptorList) {

            curNode.receptorList.forEach((item: ReceptorDirective) => {
                let viewContainerRef = item.viewContainerRef;

                if (nameMap[item.name] == null) {
                    nameMap[item.name] = 0;
                } else {
                    nameMap[item.name] = nameMap[item.name] + 1;
                }
                let nameWithCount = item.name + '-' + nameMap[item.name];
                let templateRef = transmitterMap[nameWithCount].templateRef;
                viewContainerRef.createEmbeddedView(templateRef);
            });

        }
        if (curNode.subInstanceList) {
            curNode.subInstanceList.forEach((item: RecuTemplateComponent) => {
                that.renderTemplateRecu(item, transmitterMap, nameMap);
            });
        }
    }

    ngOnInit() {
        const that = this;
        setTimeout(function () {
            let framePanelElement = document.getElementById('frame-panel');
            that.bindMineEvents(framePanelElement);
        });
    }

    bindAllEleEvents() {

        const that = this;

        setTimeout(function () {

            let elements = document.getElementsByClassName('conch-item');
            for (let i = 0; i < elements.length; i++) {
                const element: any = elements[i];

                //绑定拖动事件
                element.draggable = true;
                element.addEventListener('dragstart', function (event) {
                    that.mydragstartHandler(event);
                });

            }

        })
    }

    bindMineEvents(paramElement) {
        const that = this;

        //绑定点击事件
        paramElement.addEventListener('click', function (event) {
            that.myclickHandler(event);
        });

        //绑定右击事件
        paramElement.addEventListener('contextmenu', function (event) {
            that.myclickHandler(event);
            that.mycontextmenuHandler(event);
        });

        //绑定拖拽浮动事件
        paramElement.addEventListener('dragover', function (event) {
            that.mydragoverHandler(event);
        });

        //绑定拖放进入事件，加入边框高亮样式
        paramElement.addEventListener('dragenter', function (event) {
            that.mydragenterHandler(event);
        });

        //绑定拖放移出事件，移除边框高亮样式
        paramElement.addEventListener('dragleave', function (event) {
            that.mydragleaveHandler(event);
        });

        //绑定拖放事件
        paramElement.addEventListener('drop', function (event) {
            that.mydropHandler(event);
        });

    }

    private mydragoverHandler(event) {
//        console.log('dragover_inIframe');
        event.preventDefault();
    }

    private mydragenterHandler(event) {
        console.log('dragenter_inIframe');
        event.preventDefault();
//        event.target['classList'].add("editor_dragover");

        const that = this;

        let tmpElement;
        for (let i = 0; i < event.path.length; i++) {
            const element = event.path[i];
            if (element.attributes) {
                let attrMap = this.getAttrMapFromElement(element);
                if (attrMap['conch-id']) {
                    tmpElement = element;
                    break;
                }
            }
        }

        if (tmpElement && tmpElement != that.curDragoverElement) {
            console.log('=======resetSelectRect===========');
            that.curDragoverElement = tmpElement;
            that.resetSelectRect(tmpElement, '#654321');
        }

    }

    private mydragleaveHandler(event) {
        console.log('dragleave_inIframe');
        event.preventDefault();
//        event.target['classList'].remove("editor_dragover");
    }

    private mydragstartHandler(event) {

        console.log('===============dragstart:' + event + '====================');
        event.stopPropagation();

        for (let i = 0; i < event.path.length; i++) {
            const tmpElement = event.path[i];
            let attrMap = this.getAttrMapFromElement(tmpElement);
            if (attrMap['conch-id']) {
                event.dataTransfer.setData("drag-type", 'drag-moving');
                event.dataTransfer.setData("moving-id", attrMap['id']);
                break;
            }
        }
    }

    private mydropHandler(event) {

        const that = this;

        console.log('drop_inIframe');
        event.preventDefault();
        event.target['classList'].remove("editor_dragover");

        let [dropContainerId, dropIndex] = this.getDropContainerId(event);

//        drag-type

        let dragType = event.dataTransfer.getData("drag-type");

        if (dragType == 'drag-moving') {

            let movingId = event.dataTransfer.getData("moving-id");

            //-------------
            // 检测拖动和落点是否是同一个组件
            let element = event.target;
            if (element.attributes) {
                let attrMap = this.getAttrMapFromElement(element);
                if (attrMap['conch-id'] && attrMap['id'] == movingId) {
                    return;
                }
            }
            //---------------

            let schemaItem = that.scs.schemaMapPage[movingId];
            let dragContainerId = schemaItem.parentId;

            let dragIndex = 0;
            for (let i = 0; i < that.scs.schemaMapPage[dragContainerId].children.length; i++) {
                const childSchema = that.scs.schemaMapPage[dragContainerId].children[i];
                if (childSchema && childSchema.key == movingId) {
                    dragIndex = i;
                    break;
                }
            }

            // 将新的容器id赋值给被移动对象
            schemaItem.parentId = dropContainerId;

            that.scs.schemaMapPage[dragContainerId].children.splice(dragIndex, 1);

            if (dragContainerId == dropContainerId) {
                // 同一容器内拖拽，drop位置不增加1
                that.scs.schemaMapPage[dropContainerId].children.splice(dropIndex, 0, schemaItem);
            } else {
                that.scs.schemaMapPage[dropContainerId].children.splice(dropIndex + 1, 0, schemaItem);
            }

        } else if (dragType == 'drag-block') {
            let curBlockSchemaStr = event.dataTransfer.getData("cur-block-schema");

            let curBlockSchema = JSON.parse(curBlockSchemaStr);

            that.setKeyAndParentIdRecu(curBlockSchema, dropContainerId);

            that.scs.schemaMapPage[dropContainerId].children.splice(dropIndex + 1, 0, curBlockSchema);

        } else if (dragType == 'drag-comp') {

            let inComp = JSON.parse(event.dataTransfer.getData("curComp"));

            let tmpConchId = that.scs.guid();

            // 处理数据

            let constComp = that.ccs.compConfigMap[inComp.comp_code];

            let tmp_view_list = [];
            if (constComp.model_config) {
                tmp_view_list = that.scs.mergeModelViewList(constComp.model_view_list, constComp.model_config);
            }

            let tmpModelKeyMap = {}; // 存储原装配置中所有模型字段的key和value
            constComp.model_view_list.forEach((viewObj: any) => {
                if (viewObj.view_type == 'select') { // 视图类型是下拉框
                    if (viewObj.data_src == 'model') { // 下拉取值来源是模型
                        let tmpValue = constComp.model_config[viewObj.field];
                        tmpModelKeyMap[viewObj.field] = tmpValue;
                    }
                }
            });

            let tmpStyleConfig = JSON.parse(JSON.stringify(this.ccs.style_config));
            if (constComp.style_config) {
                tmpStyleConfig = Object.assign(tmpStyleConfig, constComp.style_config);
            }

            that.scs.curDataConch = {
                conchId: tmpConchId, // 前端生成id
                isLayout: false
            };

            that.scs.curStyleConch = {
                style_config: tmpStyleConfig,
            };

            that.scs.curSelectedConch = {
                model_view_list: tmp_view_list,
            };

            // 添加page_schema
            let isLeaf = true;
            let icon = 'anticon anticon-setting';
            if (inComp.comp_code == 'LayoutRow' || inComp.comp_code == 'LayoutColumn') {
                isLeaf = false;
                icon = 'anticon anticon-wallet';
            }

            //=============

            let styleObj = tmpStyleConfig || {};

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
            //=============

            let schemaItem = {
                title: inComp.comp_name,
                key: tmpConchId,
                icon: icon,
                isLeaf: isLeaf,
                expanded: true,
                children: [],

                parentId: dropContainerId,
                comp_code: inComp.comp_code,
                model_config: constComp.model_config,
                style_config: tmpStyleConfig,
                styleNew: styleNew,
                model_key_map: tmpModelKeyMap
            };

            that.scs.schemaMapPage[dropContainerId].children.splice(dropIndex + 1, 0, schemaItem);

        }

        // 更新图层树
        that.scs.pageSchema = JSON.parse(JSON.stringify(that.scs.pageSchema));
        that.scs.pickPageSchemaItem(that.scs.pageSchema[0]);

        // 处理dom
        that.scs.cmEmitter('msg-refresh-root-dom');

    }

    private setKeyAndParentIdRecu(curObj: any, parentId: any) {

        const that = this;

        curObj.parentId = parentId;
        let key = that.scs.guid()
        curObj.key = key;

        if (curObj.children) {
            for (let i = 0; i < curObj.children.length; i++) {
                const curChild = curObj.children[i];
                that.setKeyAndParentIdRecu(curChild, key);
            }
        }

    }

    private getDropContainerId(event) {
        let tmpContainerId;
        let dropIndex;
        for (let i = 0; i < event.path.length; i++) {
            const element = event.path[i];
            if (element.attributes) {
                let attrMap = this.getAttrMapFromElement(element);

                if (attrMap['conch-id'] && attrMap['container-tag']) {
                    tmpContainerId = attrMap['id'];
                    dropIndex = 0;
                    if (element.children.length > 0) {
                        dropIndex = element.children.length - 1;
                    }
                    break;
                } else if (attrMap['conch-id']) {

                    let attrMap = this.getAttrMapFromElement(element.parentElement);
                    tmpContainerId = attrMap['id'];

                    for (let j = 0; j < element.parentElement.children.length; j++) {
                        const parentChild = element.parentElement.children[j];
                        if (parentChild == element) {
                            dropIndex = j;
                            break
                        }
                    }
                    break;
                }
            }
        }
        return [tmpContainerId, dropIndex];
    }

    private getAttrMapFromElement(element) {
        let attrMap = {};
        for (let j = 0; j < element.attributes.length; j++) {
            const attrObj = element.attributes[j];
            if (attrObj.name == 'conch-id') {
                attrMap['conch-id'] = 1;
            } else if (attrObj.name == 'container-tag') {
                attrMap['container-tag'] = 1;
            } else if (attrObj.name == 'id') {
                attrMap['id'] = attrObj.value;
            }
        }
        return attrMap;
    }

    private myclickHandler(event) {

        const that = this;

        event.preventDefault();

        let firstElement = that.getFirstConchElement(event);
        that.resetSelectRect(firstElement);

        this.scs.cmcEmitter('msg-choose-conch', {conchId: that.scs.curDataConch.conchId});

        that.resetPropertyData();

    }

    dropDownClick(event: NzMenuItemDirective): void {

        let command = event['hostElement'].nativeElement.innerText;

        if (command == '删除') {
            this.scs.cmEmitter('msg-remove-item');
        } else if (command == '另存为') {
            this.scs.cmEmitter('msg-add-block');
        }

        this.rightMenuPanel.close();
    }

    private mycontextmenuHandler(event) {

        const that = this;

        event.preventDefault();

        this.rightMenuPanel = this.nzDropdownService.create(event, this.contextMenuTemp);

    }

    private resetPropertyData() {

        const that = this;

        if (that.scs.curDataConch.isLayout) {
            that.scs.curSelectedConch.propTabActive = 2;
        } else {
            that.scs.curSelectedConch.propTabActive = 1;
        }

        let schemaItem = that.scs.schemaMapPage[that.scs.curDataConch.conchId];
        that.scs.curStyleConch.style_config = schemaItem.style_config || {}; // 跟组件为空，赋值默认值

        if (schemaItem.comp_code) {

            let constComp = that.ccs.compConfigMap[schemaItem.comp_code];

            let tmp_view_list = that.scs.mergeModelViewList(constComp.model_view_list, schemaItem.model_config);
            that.scs.curSelectedConch.model_view_list = tmp_view_list;

        } else {
            that.scs.curSelectedConch.model_view_list = [];
        }

        that.changeDetectorRef.markForCheck();
        that.changeDetectorRef.detectChanges();
    }

    // 从当前节点向上找到第一个可编辑节点 有依赖不能转移
    private getFirstConchElement(event) {
        const that = this;
        let conchElement = event.target;
        for (let i = 0; i < event.path.length; i++) {
            const element = event.path[i];
            if (element.attributes) {
                let attrMap = this.getAttrMapFromElement(element);
                if (attrMap['conch-id']) {

                    conchElement = element;
                    that.scs.curDataConch.conchId = attrMap['id'];

                    if (attrMap['container-tag']) {
                        that.scs.curDataConch.isLayout = true;
                    } else {
                        that.scs.curDataConch.isLayout = false;
                    }

                    break;
                }
            }
        }
        return conchElement;
    }

    // 定位框
    resetSelectRect(inBlockElement, paramColor?: any) {

        let borderWidth = 1;

        let rectColor = '#2de2c5';
        let borderFix = 0;

        if (this.scs.curDataConch.isLayout) {
            rectColor = '#fcc45f';
//            rectColor = '#5bb6fd';
//            rectColor = 'rgba(33, 133, 240, 1)';
            borderFix = 2;
        }

        if (paramColor) {
            rectColor = paramColor;
        }

        let focusRectLeft = document.getElementById('focus-rect-left');
        let focusRectRight = document.getElementById('focus-rect-right');
        let focusRectTop = document.getElementById('focus-rect-top');
        let focusRectBottom = document.getElementById('focus-rect-bottom');

        focusRectLeft.style.display = 'none';
        focusRectRight.style.display = 'none';
        focusRectTop.style.display = 'none';
        focusRectBottom.style.display = 'none';

        focusRectLeft.style.width = borderWidth + 'px';
        focusRectLeft.style.height = inBlockElement.clientHeight + 'px';
        focusRectLeft.style.top = inBlockElement.offsetTop + 'px';
        focusRectLeft.style.left = inBlockElement.offsetLeft + 'px';
        focusRectLeft.style.backgroundColor = rectColor;

        focusRectRight.style.width = borderWidth + 'px';
        focusRectRight.style.height = inBlockElement.clientHeight + 'px';
        focusRectRight.style.top = inBlockElement.offsetTop + 'px';
        focusRectRight.style.left = (inBlockElement.offsetLeft + inBlockElement.clientWidth - borderWidth + borderFix) + 'px';
        focusRectRight.style.backgroundColor = rectColor;

        focusRectTop.style.width = inBlockElement.clientWidth + 'px';
        focusRectTop.style.height = borderWidth + 'px';
        focusRectTop.style.top = inBlockElement.offsetTop + 'px';
        focusRectTop.style.left = inBlockElement.offsetLeft + 'px';
        focusRectTop.style.backgroundColor = rectColor;

        focusRectBottom.style.width = inBlockElement.clientWidth + 'px';
        focusRectBottom.style.height = borderWidth + 'px';
        focusRectBottom.style.top = (inBlockElement.offsetTop + inBlockElement.clientHeight - borderWidth + borderFix) + 'px';
        focusRectBottom.style.left = inBlockElement.offsetLeft + 'px';
        focusRectBottom.style.backgroundColor = rectColor;

        setTimeout(function () {
            focusRectLeft.style.display = 'block';
            focusRectRight.style.display = 'block';
            focusRectTop.style.display = 'block';
            focusRectBottom.style.display = 'block';
        })
    }

    hideSelectRect() {

        const that = this;

        // 隐藏选择图层
        let focusRectLeft = document.getElementById('focus-rect-left');
        let focusRectRight = document.getElementById('focus-rect-right');
        let focusRectTop = document.getElementById('focus-rect-top');
        let focusRectBottom = document.getElementById('focus-rect-bottom');

        focusRectLeft.style.display = 'none';
        focusRectRight.style.display = 'none';
        focusRectTop.style.display = 'none';
        focusRectBottom.style.display = 'none';

    }

    chooseProject(projectObj: any) {
        this.scs.cmcEmitter('msg-choose-project', projectObj);
    }

    removeProject(projectObj: any) {

        const that = this;

        this.scs.ipcRequest('ipc-remove-project', projectObj, (event: any, response: any) => {
            console.log('ipc-remove-project-bak');
            if (response) {
                that.zone.run(() => {
                    that.message.create('success', '删除成功');
                });

                that.scs.cmEmitter('msg-remove-project');
            }
        });
    }

}
