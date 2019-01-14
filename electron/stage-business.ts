import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmdirSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "fs";
import {TemplateBusiness} from "./const/template-business";
import {GenFileService} from "./const/gen-file.service";
import {ConchDao} from "./const/conch-dao";
import {ConchFile} from "./service/conch-file";
import {Const} from "./const/const";

export class StageBusiness {

    conchDao: ConchDao;
    conchFile: ConchFile;
    cheerio: any;

    templateBusiness: TemplateBusiness;
    genFileService: GenFileService;
    const: Const;

    constructor() {
        this.conchDao = new ConchDao();
        this.conchFile = new ConchFile();
        this.cheerio = require('cheerio');

        this.templateBusiness = new TemplateBusiness();
        this.genFileService = new GenFileService();
        this.const = new Const();

    }

    queryBlockAll() {

        let folder_path = this.const.home_path + '/ud_block';
        if (!existsSync(folder_path)) {
            mkdirSync(folder_path);
        }

        let rows = this.conchDao.getDataListFromHome('ud_block');

        return rows;
    };

    updatePageSchema(pageVO) {

        // ============更新page_schema=================

        // 检测并读取文件
        let file_path_2 = pageVO.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (existsSync(file_path_2)) {
            let json_data = readFileSync(file_path_2, {encoding: 'utf-8'});
            pageSchema = JSON.parse(json_data);
        }

        pageSchema[pageVO.page_code] = JSON.parse(pageVO.page_schema);

        // 写入文件
        writeFileSync(file_path_2, JSON.stringify(pageSchema));

        // =============================================

        let fileMap = {};
        this.getFileCompRecu(pageSchema[pageVO.page_code], fileMap);

        let sub_path = '/' + pageVO.page_name;
        let baseDestDir = pageVO.base_app + pageVO.folder_path + sub_path;

        for (let fileCompName in fileMap) {
            let baseSrcDir = this.const.resource_base + '/temp_comp/' + fileCompName;

            let finalDescDir = baseDestDir + '/' + fileCompName;
            if (!existsSync(finalDescDir)) {
                mkdirSync(finalDescDir);
            }
            this.genFileService.scanDirFunc(baseSrcDir, finalDescDir, '');
        }

        this.conchFile.weaveModule(pageVO, fileMap);
        // =============================================
        let compMap = this.conchDao.getCompMap();

        // =============================================

        let pageSchemaObj = JSON.parse(pageVO.page_schema);

        let outerObj = {
            indexCountMap: {},
            keyIndexMap: {}
        };

        this.walkSchemaForIndexRecu(pageSchemaObj, outerObj);
        // =============================================

        this.conchFile.weaveHtmlAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveScriptAll(pageVO, compMap, outerObj.keyIndexMap);
        this.conchFile.weaveStyleAll(pageVO, compMap, outerObj.keyIndexMap);
        // =============================================

    }

    private walkSchemaForIndexRecu(curNode: any, outerObj: any) {

        if (curNode.comp_code) {
            if (outerObj.indexCountMap[curNode.comp_code] == null) {
                outerObj.indexCountMap[curNode.comp_code] = 0;
                outerObj.keyIndexMap[curNode.key] = 0;
            } else {
                let curIndex = outerObj.indexCountMap[curNode.comp_code];
                outerObj.indexCountMap[curNode.comp_code] = curIndex + 1;
                outerObj.keyIndexMap[curNode.key] = curIndex + 1;
            }
        }

        if (curNode.children) {
            for (let i = 0; i < curNode.children.length; i++) {
                const child = curNode.children[i];
                this.walkSchemaForIndexRecu(child, outerObj);
            }
        }
    }

    queryDemoDataAll() {
        let demoDataMap = {};

        let tmpPath = this.const.resource_base + '/data_demo';
        let dir = readdirSync(tmpPath);
        dir.forEach(function (item: any) {
            let filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (existsSync(filePath)) {
                let json_data = readFileSync(filePath, {encoding: 'utf-8'});
                fileObj = JSON.parse(json_data);
                demoDataMap[item.split('.')[0]] = fileObj;
            }
        });

        return demoDataMap;
    }

    queryModelAll() {
        let modelList = this.conchDao.getDataJsonByName('ud_model');
        return modelList;
    }

    queryCompAll() {

        let compList = this.conchDao.getDataJsonByName('ud_comp');

        return compList;
    };

//=====================================

    private getFileCompRecu(treeNode, fileMap) {

        if (treeNode.comp_code == 'BaseInfo') {
            let tmpName = 'base-info';
            fileMap[tmpName] = 1;
        }
        if (treeNode.comp_code == 'Line') {
            let tmpName = 'chart';
            fileMap[tmpName] = 1;
        }
        if (treeNode.children && treeNode.children.length > 0) {
            for (let i = 0; i < treeNode.children.length; i++) {
                const childNode = treeNode.children[i];
                this.getFileCompRecu(childNode, fileMap);
            }
        }
    }

//=====================================

    syncTable(paramObj: any) {

        let table_name = paramObj.table_name;
        let comp_code = paramObj.comp_code;
        if (table_name == 'ud_comp') {
            this.syncCompTable(comp_code);
        } else {
            this.syncModelTable();
        }
    }

    async syncCompTable(comp_code) {
        let codeMap = {
            'BaseInfo': 1,
//            'Table': 1,
//            'Tree': 1,
        };

        let file_base = this.const.resource_base + '/data_table/ud_comp';

        let querySql = 'select * from ud_comp';
        let compList: any = await this.conchDao.queryTableAll(querySql);

        for (let i = 0; i < compList.length; i++) {
            const compObj = compList[i];
//            if (!codeMap[compObj.comp_code]) {
//                continue;
//            }

            let file_path = file_base + '/' + compObj.comp_code + '.json';
            writeFileSync(file_path, JSON.stringify(compObj));
        }
    }

    async syncModelTable() {

        let file_base = this.const.resource_base + '/data_table/ud_model';

        let querySql = 'select * from ud_model';
        let compList: any = await this.conchDao.queryTableAll(querySql);

        for (let i = 0; i < compList.length; i++) {
            const compObj = compList[i];

            let file_path = file_base + '/' + compObj.model_code + '.json';
            writeFileSync(file_path, JSON.stringify(compObj));
        }
    }

}