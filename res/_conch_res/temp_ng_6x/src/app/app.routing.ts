import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'first-comp',
        pathMatch: 'full'
    },

    // ====include_start====
    // ====include_end====

    {
        path: 'first-comp',
        loadChildren: './framework/first-comp/first-comp.module#FirstCompModule'
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
