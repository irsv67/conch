import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgZorroAntdModule} from 'ng-zorro-antd';
import {StageRoutingModule} from './stage.routing';
import {StageComponent} from './stage.component';
import {ProjectPanelComponent} from './project-panel/project-panel.component';
import {PropertyPanelComponent} from './property-panel/property-panel.component';
import {ComponentPanelComponent} from './component-panel/component-panel.component';
import {ToolbarPanelComponent} from './toolbar-panel/toolbar-panel.component';
import {CenterPanelComponent} from './center-panel/center-panel.component';
import {BlockPanelComponent} from './block-panel/block-panel.component';
import {RouterPanelComponent} from './router-panel/router-panel.component';

import {TransmitterDirective} from './common/transmitter.directive';
import {ReceptorDirective} from './common/receptor.directive';

import {CompKeeperModule} from '../framework/comp-keeper/comp-keeper.module';
import {TemplateKeeperComponent} from './common/template-keeper/template-keeper.component';
import {RecuTemplateComponent} from './common/recu-template/recu-template.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        StageRoutingModule,
        NgZorroAntdModule,
        CompKeeperModule
    ],
    declarations: [
        TransmitterDirective,
        ReceptorDirective,
        StageComponent,
        ProjectPanelComponent,
        PropertyPanelComponent,
        ComponentPanelComponent,
        ToolbarPanelComponent,
        CenterPanelComponent,
        BlockPanelComponent,
        RouterPanelComponent,
        TemplateKeeperComponent,
        RecuTemplateComponent
    ]
})
export class StageModule {
}
