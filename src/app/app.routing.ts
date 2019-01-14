import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'stage',
        pathMatch: 'full'
    },

    // ================include_start================
    {
        path: 'first-comp',
        loadChildren: './framework/first-comp/first-comp.module#FirstCompModule'
    },
    {
        path: 'stage',
        loadChildren: './stage/stage.module#StageModule'
    },
    // ================include_end================

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
