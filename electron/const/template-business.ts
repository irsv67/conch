export class TemplateBusiness {

    constructor() {

    }

    getHtmlStr(pageName: any, pageNameUpper: any) {
        let str_b = '';
        str_b += `<!--include_start-->\r\n`;
        str_b += `${pageNameUpper} is work!\r\n`;
        str_b += `<!--include_end-->\r\n`;

        return str_b;
    }

    getCompStr(pageName: any, pageNameUpper: any) {

        let str_b = '';
        str_b += `import {Component, OnInit} from '@angular/core';\r\n`;
        str_b += `import {${pageNameUpper}Service} from './${pageName}.service';\r\n`;
        str_b += `// ====script_import_start====\r\n`;
        str_b += `// ====script_import_end====\r\n`;
        str_b += `\r\n`;
        str_b += `@Component({\r\n`;
        str_b += `    selector: 'app-${pageName}',\r\n`;
        str_b += `    templateUrl: './${pageName}.component.html',\r\n`;
        str_b += `    styleUrls: ['./${pageName}.component.css']\r\n`;
        str_b += `})\r\n`;
        str_b += `export class ${pageNameUpper}Component implements OnInit {\r\n`;
        str_b += `\r\n`;
        str_b += `    // ====script_attr_start====\r\n`;
        str_b += `    // ====script_attr_end====\r\n`;
        str_b += `\r\n`;
        str_b += `    constructor(private pageService: ${pageNameUpper}Service) {\r\n`;
        str_b += `    }\r\n`;
        str_b += `\r\n`;
        str_b += `    ngOnInit() {\r\n`;
        str_b += `        const that = this;\r\n`;
        str_b += `        // ====script_init_start====\r\n`;
        str_b += `        // ====script_init_end====\r\n`;
        str_b += `    }\r\n`;
        str_b += `\r\n`;
        str_b += `    // ====script_func_start====\r\n`;
        str_b += `    // ====script_func_end====\r\n`;
        str_b += `\r\n`;
        str_b += `}\r\n`;

        return str_b;
    }

    getStyleStr(pageName: any, pageNameUpper: any) {
        let str_b = '';
        str_b += `/*====include_start====*/\r\n`;
        str_b += `/*====include_end====*/\r\n`;
        return str_b;
    }

    getModuleStr(pageName: any, pageNameUpper: any) {

        let str_b = '';
        str_b += `import {NgModule} from '@angular/core';\r\n`;
        str_b += `import {CommonModule} from '@angular/common';\r\n`;
        str_b += `import {FormsModule} from '@angular/forms';\r\n`;
        str_b += `import {NgZorroAntdModule} from 'ng-zorro-antd';\r\n`;
        str_b += `import {${pageNameUpper}Service} from './${pageName}.service';\r\n`;
        str_b += `import {${pageNameUpper}RoutingModule} from './${pageName}.routing';\r\n`;
        str_b += `import {${pageNameUpper}Component} from './${pageName}.component';\r\n`;
        str_b += `// ====module_import_start====\r\n`;
        str_b += `// ====module_import_end====\r\n`;
        str_b += `\r\n`;
        str_b += `@NgModule({\r\n`;
        str_b += `    imports: [\r\n`;
        str_b += `        CommonModule,\r\n`;
        str_b += `        FormsModule,\r\n`;
        str_b += `        ${pageNameUpper}RoutingModule,\r\n`;
        str_b += `        NgZorroAntdModule\r\n`;
        str_b += `    ],\r\n`;
        str_b += `    declarations: [\r\n`;
        str_b += `        // ====module_declarations_start====\r\n`;
        str_b += `        // ====module_declarations_end====\r\n`;
        str_b += `        ${pageNameUpper}Component\r\n`;
        str_b += `],\r\n`;
        str_b += `    providers: [${pageNameUpper}Service]\r\n`;
        str_b += `})\r\n`;
        str_b += `export class ${pageNameUpper}Module {\r\n`;
        str_b += `}\r\n`;

        return str_b;
    }

    getServiceStr(pageName: any, pageNameUpper: any) {

        let str_b = '';
        str_b += `import {Injectable} from '@angular/core';\r\n`;
        str_b += `import {HttpClient} from '@angular/common/http';\r\n`;
        str_b += `\r\n`;
        str_b += `@Injectable()\r\n`;
        str_b += `export class ${pageNameUpper}Service {\r\n`;
        str_b += `\r\n`;
        str_b += `    constructor(private http: HttpClient) {\r\n`;
        str_b += `    }\r\n`;
        str_b += `\r\n`;
        str_b += `    getDataSet(name) {\r\n`;
        str_b += `        const configUrl: any = './assets/data/' + name + '.json';\r\n`;
        str_b += `        return this.http.get(configUrl);\r\n`;
        str_b += `    }\r\n`;
        str_b += `\r\n`;
        str_b += `}\r\n`;

        return str_b;
    }

    getRoutingStr(pageName: any, pageNameUpper: any) {

        let str_b = '';
        str_b += `import {NgModule} from '@angular/core';\r\n`;
        str_b += `import {RouterModule, Routes} from '@angular/router';\r\n`;
        str_b += `import {${pageNameUpper}Component} from './${pageName}.component';\r\n`;
        str_b += `\r\n`;
        str_b += `const appRoutes: Routes = [\r\n`;
        str_b += `    {\r\n`;
        str_b += `        path: '',\r\n`;
        str_b += `        redirectTo: '${pageName}',\r\n`;
        str_b += `        pathMatch: 'full'\r\n`;
        str_b += `    }, {\r\n`;
        str_b += `        path: '${pageName}',\r\n`;
        str_b += `        component: ${pageNameUpper}Component,\r\n`;
        str_b += `    }\r\n`;
        str_b += `];\r\n`;
        str_b += `\r\n`;
        str_b += `@NgModule({\r\n`;
        str_b += `    imports: [\r\n`;
        str_b += `        RouterModule.forChild(appRoutes)\r\n`;
        str_b += `    ],\r\n`;
        str_b += `    exports: [\r\n`;
        str_b += `        RouterModule\r\n`;
        str_b += `    ]\r\n`;
        str_b += `})\r\n`;
        str_b += `export class ${pageNameUpper}RoutingModule {\r\n`;
        str_b += `\r\n`;
        str_b += `}\r\n`;

        return str_b;
    }

    getRouterStr(folderPath: any, pageName: any, pageNameUpper: any) {

        let str_b = '';
        str_b += `    {\r\n`;
        str_b += `        path: '${pageName}',\r\n`;
        str_b += `        loadChildren: '.${folderPath}/${pageName}/${pageName}.module#${pageNameUpper}Module'\r\n`;
        str_b += `    },`;

        return str_b;
    }

    getMenuStr(folderPath: any, pageName: any, menuName: any) {

        let str_b = '';
        str_b += `        {\r\n`;
        str_b += `            name: '${pageName}',\r\n`;
        str_b += `            desc: '${menuName}',\r\n`;
        str_b += `            url: '/${pageName}/${pageName}'\r\n`;
        str_b += `        },`;

        return str_b;
    }
}
