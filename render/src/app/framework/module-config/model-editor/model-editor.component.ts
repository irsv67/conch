import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {ModelEditorService} from "./model-editor.service";
import {NzDropdownService, NzMessageService} from "ng-zorro-antd";

@Component({
    selector: 'app-model-editor',
    templateUrl: './model-editor.component.html',
    styleUrls: ['./model-editor.component.css']
})
export class ModelEditorComponent implements OnInit {

    modelTypeTree = []; // 左侧树
    curModel: any; // 当前树节点，当前模型

    columnViewList: any = []; // 当前节点条目数组
    curColunn: any; // 当前条目

    constructor(public modelEditorService: ModelEditorService,
                private message: NzMessageService,
                private changeDetectorRef: ChangeDetectorRef,
                private zone: NgZone) {

        const that = this;
        // this.scs.cm$.subscribe((msg: any) => {
        //     if (msg == 'msg-get-model-tree') {
        //         that.getModelTree();
        //     }
        // });

    }

    ngOnInit() {

    }

    chooseModelTypeNode(event) {
        this.curModel = event.node.origin;
        let model_data = this.curModel.model_data;
        if (this.curModel.model_type == 'table') {
            this.columnViewList = JSON.parse(model_data).listArray;

        } else if (this.curModel.model_type == 'form') {
            this.columnViewList = JSON.parse(model_data).formArray;

        }
    }

    getModelTree() {
        const that = this;
        this.modelEditorService.getModelTree().subscribe((response: any) => {
            if (response) {
                that.modelTypeTree = [response.data];
            }
        });
    }

    saveCurModel() {
        const that = this;
        let tmpMoelData = JSON.parse(this.curModel.model_data);
        if (this.curModel.model_type == 'table') {
            tmpMoelData.listArray = this.columnViewList;
        } else if (this.curModel.model_type == 'form') {
            tmpMoelData.formArray = this.columnViewList;
        }
        this.curModel.model_data = JSON.stringify(tmpMoelData);

        this.modelEditorService.saveModel(this.curModel).subscribe((response: any) => {
            if (response) {
                that.message.create('success', `保存成功`);
            }
        });
    }

    editColumn(column) {
        this.curColunn = column;
    }

    addColumn() {
        this.curColunn = {
            field: 'column' + this.columnViewList.length,
            desc: '新增列' + this.columnViewList.length,
            type: 'normal'
        };
        this.columnViewList.push(this.curColunn);
    }

    removeColumn() {

        let curIndex = -1;
        for (let i = 0; i < this.columnViewList.length; i++) {
            const columnObj = this.columnViewList[i];
            if (columnObj.field == this.curColunn.field) {
                curIndex = i;
            }
        }

        if (curIndex != -1) {
            this.columnViewList.splice(curIndex, 1);
        }

        if (this.columnViewList.length > 0) {
            this.curColunn = this.columnViewList[this.columnViewList.length];
        }

    }
}
