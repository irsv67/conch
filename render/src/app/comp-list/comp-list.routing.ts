import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CompListComponent} from './comp-list.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'comp-list',
        pathMatch: 'full'
    }, {
        path: 'comp-list',
        component: CompListComponent,
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
export class CompListRoutingModule {

}
