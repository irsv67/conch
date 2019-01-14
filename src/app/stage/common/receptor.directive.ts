import {Directive, Input, OnInit, ViewContainerRef} from '@angular/core';

@Directive({
    selector: '[receptor-host]',
})
export class ReceptorDirective implements OnInit {

    @Input() name: string;

    constructor(public viewContainerRef: ViewContainerRef) {
    }

    ngOnInit() {

    }
}
