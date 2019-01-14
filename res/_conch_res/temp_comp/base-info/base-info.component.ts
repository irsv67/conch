import * as extend from 'extend';
import {Component, Input} from '@angular/core';

let $scope;

@Component({
    selector: 'app-base-info',
    templateUrl: './base-info.component.html',
    styleUrls: ['./base-info.component.less']
})

export class BaseInfoComponent {

    public vm = {

        header: {
            major: '',
            minor: ''
        },

        baseProperty: {
            itemData: [],
            itemColon: '：',
            moreText: '展开更多'
        },

        theCrowd: {
            title: '所属人群',
            itemData: [],
            moreText: '展开更多',
            morePower: false
        },
        
        theLabel: {
            title: '所属标签',
            itemData: [],
            moreText: '展开更多',
            morePower: false

        },
        theInvalidLabel: {
            title: '已失效标签',
            itemData: [],
            moreText: '展开更多',
            morePower: false
        },


    };

    @Input()
    private set headerMajor($value: any) {

        let vm = $scope.vm;

        if ($value) vm.header.major = $value;

    }

    @Input()
    private set headerMinor($value: any) {

        let vm = $scope.vm;

        if ($value) vm.header.minor = $value;

    }

    @Input()
    private set baseInfo($value: any) {

        let vm = $scope.vm;

        if ($value) vm.baseProperty.itemData = $value;

    }

    @Input()
    private set theCrowd($value: any) {

        let vm = $scope.vm;

        if ($value) vm.theCrowd.itemData = extend(true, [], $value);

    }

    @Input()
    private set theLabel($value: any) {

        let vm = $scope.vm;

        if ($value) vm.theLabel.itemData = extend(true, [], $value);

    }

    @Input()
    private set theInvalidLabel($value: any) {

        let vm = $scope.vm;

        if ($value) vm.theInvalidLabel.itemData = extend(true, [], $value);

    }

    constructor() {

        $scope = this;

    }

    handlerBasePropertyMore(itemGroup: any) {

        itemGroup.morePower = !itemGroup.morePower;

    }

}
