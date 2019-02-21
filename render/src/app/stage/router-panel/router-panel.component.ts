import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {StageService} from "../stage.service";
import {StageCommService} from "../stage-comm.service";
import {NzMessageService} from "ng-zorro-antd";

@Component({
    selector: 'app-router-panel',
    templateUrl: './router-panel.component.html',
    styleUrls: ['./router-panel.component.css']
})
export class RouterPanelComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

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
            if (msg == 'router-module') {
                that.scanRouting();
            }
        });
    }

    ngOnInit() {

        const that = this;

    }

    scanRouting() {
        const that = this;

        this.scs.ipcRequest('ipc-scan-routing', this.scs.curProject, (event: any, response: any) => {
            console.log('ipc-scan-routing-bak');
            if (response) {
                that.zone.run(() => {
                    that.scs.routingSchema = [response.data];
                });
            }
        });

    }

    scanSubComp(event) {
        const that = this;

        let paramObj = {
            component_name: event.node.key,
            root_path: this.scs.curProject.root_path
        };

        this.scs.ipcRequest('ipc-scan-sub-comp', paramObj, (event: any, response: any) => {
            console.log('ipc-scan-sub-comp-bak');
            if (response) {
                that.zone.run(() => {
                    that.scs.compSchema = [response.data];
                });
            }
        });

    }

}
