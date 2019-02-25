import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {StageService} from '../stage/stage.service';
import {StageCommService} from '../stage/stage-comm.service';
import {NzDropdownService, NzMessageService} from 'ng-zorro-antd';

@Component({
    selector: 'app-comp-list',
    templateUrl: './comp-list.component.html',
    styleUrls: ['./comp-list.component.css']
})
export class CompListComponent implements OnInit {

    constructor(private stageService: StageService,
                public scs: StageCommService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {
    }

    ngOnInit() {
        this.queryCompDomByType('all');
    }

    chooseCompTypeNode(event: any) {
        this.queryCompDomByType(event.node.key);
    }

    queryCompDomByType(type: any) {
        const that = this;
        if (type == 'all') {
            type = null;
        }

        this.scs.ipcRequest('ipc-get-comp-dom-list', type, (event: any, response: any) => {
            console.log('ipc-get-comp-dom-list-bak');
            if (response) {
                document.getElementById('comp-view-panel').innerHTML = response.data;
            }
        });
    }
}
