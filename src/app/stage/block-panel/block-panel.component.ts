import {ChangeDetectorRef, Component, OnInit, NgZone} from '@angular/core';
import {StageService} from "../stage.service";
import {StageCommService} from "../stage-comm.service";
import {NzMessageService} from "ng-zorro-antd";

@Component({
    selector: 'app-block-panel',
    templateUrl: './block-panel.component.html',
    styleUrls: ['./block-panel.component.css']
})
export class BlockPanelComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    blockList = [];
    rightMenuPanel: any;
    rightItem: any;

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
            if (msg == 'block') {
                that.queryBlockAll();
            }
        });

        this.scs.cm$.subscribe((msg: any) => {
            if (msg == 'msg-query-block') {
                that.queryBlockAll();
            }
        });

    }

    ngOnInit() {

    }

    queryBlockAll() {
        const that = this;

        this.scs.ipcRequest('ipc-query-block-all', null, (event: any, response: any) => {
            console.log('ipc-query-block-all-bak');
            if (response) {
                that.zone.run(() => {
                    that.blockList = response.data;
                });
            }
        });
    }

    //拖拽开始处理
    dragstart(event, item) {
        event.dataTransfer.setData("drag-type", 'drag-block');
        event.dataTransfer.setData("cur-block-schema", item.block_schema);
        console.log('dragstart');
        this.scs.cmEmitter('msg-hide-select-rect');
    }

    rightClickNode(event: any, item: any) {

        this.rightItem = item;
        let menuDom2 = document.getElementById('remove-block-menu');

        menuDom2.style.display = 'block';

        menuDom2.style.left = event.layerX + 'px';
        menuDom2.style.top = event.layerY + 'px';

    }

    dropDownClick(): void {

        const that = this;

        let menuDom = document.getElementById('remove-block-menu');
        menuDom.style.display = 'none';

        this.scs.ipcRequest('ipc-remove-block', this.rightItem, (event: any, response: any) => {
            console.log('ipc-remove-block-bak');
            if (response) {
                that.message.create('success', '删除成功');
                that.queryBlockAll();
            }
        });

    }

    blankClick() {
        let menuDom = document.getElementById('remove-block-menu');
        menuDom.style.display = 'none';
    }
}
