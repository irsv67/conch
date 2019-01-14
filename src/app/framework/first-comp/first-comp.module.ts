import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {FirstCompService} from './first-comp.service';
import {FirstCompRoutingModule} from './first-comp.routing';
import {FirstCompComponent} from './first-comp.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FirstCompRoutingModule,
        NgZorroAntdModule
    ],
    declarations: [FirstCompComponent],
    providers: [FirstCompService]
})
export class FirstCompModule {
}
