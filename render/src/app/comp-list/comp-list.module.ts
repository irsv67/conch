import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompListComponent} from './comp-list.component';
import {CompListRoutingModule} from './comp-list.routing';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgZorroAntdModule,
        CompListRoutingModule
    ],
    declarations: [
        CompListComponent
    ]
})
export class CompListModule {
}
