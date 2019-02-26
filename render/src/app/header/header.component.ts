import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {StageService} from '../stage/stage.service';
import {StageCommService} from '../stage/stage-comm.service';
import {NzDropdownService, NzMessageService} from 'ng-zorro-antd';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    ipcRenderer: any; // 与electron通信
    shell: any; // 与electron通信

    headerTabStatus: any = 'project'; // project, template, component, block

    constructor(private router: Router,
                private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {

        const that = this;
        const electron = window['electron'];
        this.ipcRenderer = electron.ipcRenderer;
        this.shell = electron.shell;

    }

    ngOnInit() {
    }

    changeHeaderStatus(type: any) {
        this.headerTabStatus = type;
        if (type == 'project') {
            this.router.navigate(['/stage', {}]);
        } else if (type == 'component') {
            this.router.navigate(['/comp-list', {}]);
        } else if (type == 'module-tree') {
            this.router.navigate(['/module-config/module-tree', {}]);
        }
    }

    closeWindow() {
        window.close();
    }

    minWindow() {
        this.ipcRenderer.send('window-min');
    }

    maxWindow() {
        this.ipcRenderer.send('window-max');
    }

}
