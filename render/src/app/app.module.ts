import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgZorroAntdModule, NZ_I18N, zh_CN, NZ_MESSAGE_CONFIG, NZ_NOTIFICATION_CONFIG} from "ng-zorro-antd";
import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app.routing";

import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';

registerLocaleData(zh);

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        NgZorroAntdModule.forRoot()
    ],
    providers: [
        {provide: NZ_I18N, useValue: zh_CN}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
