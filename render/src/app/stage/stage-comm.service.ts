import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {StageService} from "./stage.service";
import {ConchConfigService} from "../conch/conch-config.service";

@Injectable({
    providedIn: 'root'
})
export class StageCommService {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信
    callbackMap: any = {};

    projectList: any = [];

    curProject: any;//当前项目

    curEditTreeNode: any; // 当前编辑页面对应的树节点
    curPage: any;//当前编辑页面

    // ===============

    modelList: any = [];
    modelCodeMap: any = {}; // 模型按编码储存

    demoDataMap = {}; // 假数据按模型编码储存

    // ===============

    pageSchema: any = [];
    schemaMapPage: any = {};

    //===============

    schemaSrcMap: any = {};

    compSchema: any = [];
    routingSchema: any = [];

    //当前编辑选中条目
    curSelectedConch: any = {
        model_view_list: [],
        propTabActive: 1
    };

    curDataConch: any = {
        conchId: '',
        isLayout: false
    };

    curStyleConch: any = {
        style_config: {},
    };

    mainPanelStatus: any = 'blank';

    isConch: any;

    leftPanelActive: any = 'blank';

    constructor(public ccs: ConchConfigService,
                private stageService: StageService) {
        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;
    }

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private getModelListByType(modelList, data_type) {

        let retList = [];
        for (let i = 0; i < modelList.length; i++) {
            const modelObj = modelList[i];
            if (modelObj.model_type == data_type) {
                retList.push(modelObj);
            }
        }

        return JSON.parse(JSON.stringify(retList));
    }

    mergeModelViewList(param_view_list, param_config) {
        const that = this;
        let tmp_view_list = JSON.parse(JSON.stringify(param_view_list));
        let tmp_config = JSON.parse(JSON.stringify(param_config));

        tmp_view_list.forEach((viewObj: any) => {
            viewObj.value = tmp_config[viewObj.field];

            if (viewObj.view_type == 'select') { // 视图类型是下拉框
                if (viewObj.data_src == 'model') { // 下拉取值来源是模型
                    viewObj.selectList = that.getModelListByType(that.modelList, viewObj.data_type);

                } else if (viewObj.data_src == 'dic') { // 下拉取值来源是字典

                } else if (viewObj.data_src == 'enum') { // 下拉取值来源是枚举
                    viewObj.selectList = that.ccs.enumMap[viewObj.data_type];
                }
            }
        });

        return tmp_view_list;
    }

    pickPageSchemaItem(rootNode: any) {
        const that = this;
        that.schemaMapPage[rootNode.key] = rootNode;
        if (rootNode.children && rootNode.children.length > 0) {
            rootNode.children.forEach((node: any) => {
                that.pickPageSchemaItem(node);
            })
        }
    }

    // ==========================================

    // commonMessage
    private cmSubject = new Subject<any>();
    cm$ = this.cmSubject.asObservable();

    cmEmitter(msg: any) {
        this.cmSubject.next(msg);
    }

    //msg-refresh-root-dom
    //msg-hide-select-rect
    //msg-query-block

    //msg-close-project
    //msg-remove-project

    // ------------

    // chooseLeftPanel
    private clpSubject = new Subject<any>();
    clp$ = this.clpSubject.asObservable();

    clpEmitter(msg: any) {
        this.clpSubject.next(msg);
    }

    // ------------

    // commonMessageParam
    private cmcSubject = new Subject<any>();
    cmc$ = this.cmcSubject.asObservable();

    cmcEmitter(msg: any, paramObj: any) {
        this.cmcSubject.next({msg: msg, paramObj: paramObj});
    }

    //msg-choose-in-layer
    //msg-choose-project
    //msg-choose-page

    //===========================

    ipcRequest(msg: any, param: any, respFunc: any) {
        this.ipcRenderer.send(msg, param);
        console.log(msg);
        if (!this.callbackMap[msg]) {
            this.ipcRenderer.on(msg + '-back', respFunc);
            this.callbackMap[msg] = true;
        }
    }
}
