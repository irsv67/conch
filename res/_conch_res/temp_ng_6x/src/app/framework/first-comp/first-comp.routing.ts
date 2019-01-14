import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FirstCompComponent} from './first-comp.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'first-comp',
        pathMatch: 'full'
    }, {
        path: 'first-comp',
        component: FirstCompComponent,
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
export class FirstCompRoutingModule {

}
