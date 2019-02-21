import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({
    selector: '[transmitter-host]',
})
export class TransmitterDirective implements OnInit {

    @Input() name: string;
    @Input() index: any;

    constructor(public templateRef: TemplateRef<string>) {
    }

    ngOnInit() {

    }
}