import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConchConfigService {

    enumMap: any = {
        "ant-button-type": [
            {
                "value": "primary",
                "desc": "主要"
            }, {
                "value": "default",
                "desc": "次要"
            }, {
                "value": "dashed",
                "desc": "虚线"
            }, {
                "value": "danger",
                "desc": "危险"
            }
        ],
        "ant-size": [
            {
                "value": "large",
                "desc": "大"
            }, {
                "value": "default",
                "desc": "中"
            }, {
                "value": "small",
                "desc": "小"
            }
        ],
        "ant-btn-sharp": [
            {
                "value": "circle",
                "desc": "圆形"
            }, {
                "value": "default",
                "desc": "默认"
            }
        ]
    };

    instanceHandler: any = {};

    compConfigMap: any = {
        "Title": {
            "model_config": {
                "name": "标题栏"
            },
            "model_view_list": [
                {
                    "desc": "名称",
                    "field": "name",
                    "view_type": "input",
                    "value": null
                }
            ]
        },
        "Navigate": {
            "model_config": {
                "name": "导航条"
            },
            "model_view_list": [
                {
                    "desc": "名称",
                    "field": "name",
                    "view_type": "input",
                    "value": null
                }
            ]
        },
        "Button": {
            "model_config": {
                "name": "按钮",
                "buttonType": "primary"
            },
            "model_view_list": [
                {
                    "desc": "名称",
                    "field": "name",
                    "view_type": "input",
                    "value": null
                }, {
                    "desc": "类型",
                    "field": "buttonType",
                    "view_type": "select",
                    "data_src": "enum",
                    "data_type": "ant-button-type",
                    "value": null
                }, {
                    "desc": "大小",
                    "field": "antSize",
                    "view_type": "select",
                    "data_src": "enum",
                    "data_type": "ant-size",
                    "value": null
                }, {
                    "desc": "形状",
                    "field": "btnSharp",
                    "view_type": "select",
                    "data_src": "enum",
                    "data_type": "ant-btn-sharp",
                    "value": null
                }
            ]
        },
        "Table": {
            "style_config": {
                "background": "#FFFFFF",
                "marginTop": 16,
                "marginLeft": 16,
                "marginRight": 16
            },
            "model_config": {
                "modelCode": "m_001"
            },
            "model_view_list": [
                {
                    "desc": "应用模型",
                    "field": "modelCode",
                    "view_type": "select",
                    "data_src": "model",
                    "data_type": "table",
                    "value": null
                }
            ]
        },
        "DatePicker": {
            "model_config": {},
            "model_view_list": []
        },
        "Input": {
            "model_config": {},
            "model_view_list": []
        },
        "Select": {
            "model_config": {},
            "model_view_list": []
        },
        "Tree": {
            "model_config": {
                "modelCode": "m_005"
            },
            "model_view_list": [
                {
                    "desc": "应用模型",
                    "field": "modelCode",
                    "view_type": "select",
                    "data_src": "model",
                    "data_type": "tree",
                    "value": null
                }
            ]
        },
        "Modal": {
            "model_config": {
                "name": "对话框",
                "modelCode": "m_003",
                "isVisible": false
            },
            "model_view_list": [
                {
                    "desc": "名称",
                    "field": "name",
                    "view_type": "input",
                    "value": null
                },
                {
                    "desc": "应用模型",
                    "field": "modelCode",
                    "view_type": "select",
                    "data_src": "model",
                    "data_type": "form",
                    "value": null
                }
            ]
        },
        "LayoutColumn": {
            "model_config": {},
            "model_view_list": []
        },
        "LayoutRow": {
            "model_config": {},
            "model_view_list": []
        },
        "Line": {
            "style_config": {
                "width": "auto",
                "heightAuto": false,
                "height": "300px",
                "background": "#FFFFFF",
                "marginTop": 16,
                "marginLeft": 16,
                "marginRight": 16
            },
            "model_config": {
                "modelCode": "m_009"
            },
            "model_view_list": [
                {
                    "desc": "应用模型",
                    "field": "modelCode",
                    "view_type": "select",
                    "data_src": "model",
                    "data_type": "chart",
                    "value": null
                }
            ]
        },
        "BaseInfo": {
            "style_config": {
                "marginTop": 16,
                "marginLeft": 16,
                "marginRight": 16
            },
            "model_config": {
                "modelCode": "m_007"
            },
            "model_view_list": [
                {
                    "desc": "应用模型",
                    "field": "modelCode",
                    "view_type": "select",
                    "data_src": "model",
                    "data_type": "user",
                    "value": null
                }
            ]

        }
    };

    style_config: any = {
        widthAuto: true,
        width: 'auto',
        heightAuto: true,
        height: 'auto',
        flex: 'none',

        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,

        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,

        background: '',
        borderRadius: '',
        boxShadow: false,
    };

    constructor() {
    }
}
