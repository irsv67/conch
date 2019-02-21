import {ChangeDetectorRef, Component, OnInit, NgZone} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";

@Component({
    selector: 'app-module-tree',
    templateUrl: './module-tree.component.html',
    styleUrls: ['./module-tree.component.css']
})
export class ModuleTreeComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    constructor(private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        let electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

    }

    ngOnInit() {

        const that = this;

    }

}
