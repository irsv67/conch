import {Component, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ReceptorDirective} from "../receptor.directive";

@Component({
    selector: 'app-recu-template',
    templateUrl: './recu-template.component.html',
    styleUrls: ['./recu-template.component.css']
})
export class RecuTemplateComponent implements OnInit {

    @Input() curNode: any;

    @ViewChildren(ReceptorDirective) receptorList: QueryList<ReceptorDirective>;
    @ViewChildren('subInstance') subInstanceList: QueryList<RecuTemplateComponent>;

    constructor() {
    }

    ngOnInit() {
    }

}
