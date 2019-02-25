import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ModuleTreeComponent} from './module-tree.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'module-tree',
        pathMatch: 'full'
    }, {
        path: 'module-tree',
        component: ModuleTreeComponent,
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class ModuleTreeRoutingModule {

}
