import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModuleTreeComponent} from './module-tree.component';
import {ModuleTreeRoutingModule} from './module-tree.routing';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgZorroAntdModule,
        ModuleTreeRoutingModule
    ],
    declarations: [
        ModuleTreeComponent
    ]
})
export class ModuleTreeModule {
}
