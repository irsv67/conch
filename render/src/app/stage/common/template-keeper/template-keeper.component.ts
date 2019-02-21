import {ChangeDetectorRef, Component, NgZone, OnInit, QueryList, TemplateRef, ViewChildren} from '@angular/core';
import {TransmitterDirective} from "../transmitter.directive";
import {StageService} from "../../stage.service";
import {StageCommService} from "../../stage-comm.service";
import {ConchConfigService} from "../../../conch/conch-config.service";
import {NzDropdownService, NzMessageService} from "ng-zorro-antd";

@Component({
    selector: 'app-template-keeper',
    templateUrl: './template-keeper.component.html',
    styleUrls: ['./template-keeper.component.css']
})
export class TemplateKeeperComponent implements OnInit {

    @ViewChildren(TransmitterDirective) transmitterList: QueryList<TemplateRef<string>>;
    // @ViewChildren(ReceptorDirective) receptorList: QueryList<ReceptorDirective>;

    constructor(private stageService: StageService,
                public scs: StageCommService,
                public ccs: ConchConfigService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private nzDropdownService: NzDropdownService,
                private zone: NgZone) {
    }

    ngOnInit() {
    }

}
