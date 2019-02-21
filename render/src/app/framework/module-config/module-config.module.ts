import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModelEditorComponent} from './model-editor/model-editor.component';
import {ModuleTreeComponent} from './module-tree/module-tree.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ModelEditorComponent,
        ModuleTreeComponent
    ]
})
export class ModuleConfigModule {
}
