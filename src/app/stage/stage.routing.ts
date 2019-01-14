import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StageComponent} from './stage.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'stage',
        pathMatch: 'full'
    }, {
        path: 'stage',
        component: StageComponent,
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
export class StageRoutingModule {

}
