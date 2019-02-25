import {ChangeDetectorRef, Component, OnInit, NgZone} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';
import {StageService} from '../stage/stage.service';
import {StageCommService} from '../stage/stage-comm.service';

@Component({
    selector: 'app-module-tree',
    templateUrl: './module-tree.component.html',
    styleUrls: ['./module-tree.component.css']
})
export class ModuleTreeComponent implements OnInit {
    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        const electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;
    }

    ngOnInit() {
        const that = this;
        that.scanRouting();
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

        const paramObj = {
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
