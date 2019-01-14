import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BaseInfoComponent} from './base-info/base-info.component';
import {ChartComponent} from './chart/chart.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ChartComponent,
        BaseInfoComponent
    ],
    exports: [
        ChartComponent,
        BaseInfoComponent
    ]
})
export class CompKeeperModule {
}
