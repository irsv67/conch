import {Component, OnInit, OnDestroy, ElementRef, Input, ViewChild} from '@angular/core';
//import * as echarts from 'echarts';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.less']
})
export class ChartComponent implements OnInit, OnDestroy {

    @ViewChild('canvas') canvas: ElementRef;

    public _chart: any;
    protected _option: any;

    private resizeBindHandler: any;

    constructor() {
        this.resizeBindHandler = this.resizeHandler.bind(this);
        window.addEventListener('resize', this.resizeBindHandler, false);
        this._option = {};
    }

    // 通用option
    @Input() set option(option: any) {
        Object.assign(this._option, option);
        if (!this._chart) {
            const echarts = window['echarts'];
            this._chart = echarts.init(this.canvas.nativeElement);
        }
        this._chart.setOption(this._option, true);
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeBindHandler, false);

        if (this._chart) {
            this._chart.dispose();
            this._chart = null;
        }
    }

    protected resizeHandler() {
        if (this._chart) {
            this._chart.resize();
        }
    }
}
