import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {StageService} from "../stage.service";
import {NzDropdownService, NzMessageService} from "ng-zorro-antd";
import {StageCommService} from "../stage-comm.service";

@Component({
    selector: 'app-component-panel',
    templateUrl: './component-panel.component.html',
    styleUrls: ['./component-panel.component.css']
})
export class ComponentPanelComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    compTypeStatus: any = 'all';

    compTypeList: any = [{
        name: '全部',
        code: 'all'
    }, {
        name: '基础',
        code: 'basic'
    }, {
        name: '业务',
        code: 'business'
    }, {
        name: '其他',
        code: 'other'
    }];

    compLayoutList = [{
        "comp_code": "LayoutColumn",
        "comp_name": "垂直布局",
        "comp_type": "layout"
    }, {
        "comp_code": "LayoutRow",
        "comp_name": "水平布局",
        "comp_type": "layout"
    }];

    compList = [];
    compListAll = [];

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

        this.scs.clp$.subscribe((msg: any) => {
            if (msg == 'component') {
                that.queryCompAll();
            }
        });

    }

    ngOnInit() {
        const that = this;

        this.scs.ipcRequest('ipc-query-demo-data-all', null, (event: any, response: any) => {
            console.log('ipc-query-demo-data-bak');
            if (response) {
                that.scs.demoDataMap = response.data;
            }
        });

        this.scs.ipcRequest('ipc-query-model-all', null, (event: any, response: any) => {
            console.log('ipc-query-model-all-bak');
            if (response) {
                that.scs.modelList = response.data;

                response.data.forEach((item: any) => {
                    that.scs.modelCodeMap[item.model_code] = item;
                });

                that.queryCompAll();
            }
        });

    }

    queryCompAll() {
        const that = this;

        this.scs.ipcRequest('ipc-query-comp-all', null, (event: any, response: any) => {
            console.log('ipc-query-comp-all-bak');
            if (response) {

                that.compList = response.data;
                that.compListAll = response.data;
                that.compTypeStatus = 'all';

            }
        });

    }

    //拖拽开始处理
    dragstart(event, item) {
        event.dataTransfer.setData("drag-type", 'drag-comp');
        event.dataTransfer.setData("curComp", JSON.stringify(item));
        console.log('dragstart');
        this.scs.cmEmitter('msg-hide-select-rect');
    }

    changeCompList(type: any) {
        const that = this;
        this.compTypeStatus = type;
        if (type == 'all') {
            that.compList = that.compListAll;
        } else {
            let tmpList = [];
            for (let i = 0; i < that.compListAll.length; i++) {
                const compObj = that.compListAll[i];
                if (compObj.comp_type == type) {
                    tmpList.push(compObj);
                }
            }
            this.compList = tmpList;
        }
    }
}
