import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'stage',
        pathMatch: 'full'
    },
    {
        path: 'stage',
        loadChildren: './stage/stage.module#StageModule'
    },
    {
        path: 'comp-list',
        loadChildren: './comp-list/comp-list.module#CompListModule'
    },
    {
        path: 'module-config',
        loadChildren: './module-tree/module-tree.module#ModuleTreeModule'
    },

];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {useHash: true}
        )
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {

}
