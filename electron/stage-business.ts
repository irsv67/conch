import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs';
import {TemplateBusiness} from './const/template-business';
import {GenFileService} from './const/gen-file.service';
import {ConchDao} from './const/conch-dao';
import {ConchFile} from './service/conch-file';
import {Const} from './const/const';

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

        const folder_path = this.const.home_path + '/ud_block';
        if (!existsSync(folder_path)) {
            mkdirSync(folder_path);
        }

        const rows = this.conchDao.getDataListFromHome('ud_block');

        return rows;
    }

    updatePageSchema(pageVO) {

        // ============更新page_schema=================

        // 检测并读取文件
        const file_path_2 = pageVO.root_path + '/_con_pro/page_schema.json';
        let pageSchema = {};
        if (existsSync(file_path_2)) {
            const json_data = readFileSync(file_path_2, {encoding: 'utf-8'});
            pageSchema = JSON.parse(json_data);
        }

        pageSchema[pageVO.page_code] = JSON.parse(pageVO.page_schema);

        // 写入文件
        writeFileSync(file_path_2, JSON.stringify(pageSchema));

        // =============================================

        const fileMap = {};
        this.getFileCompRecu(pageSchema[pageVO.page_code], fileMap);

        const sub_path = '/' + pageVO.page_name;
        const baseDestDir = pageVO.base_app + pageVO.folder_path + sub_path;

        for (const fileCompName in fileMap) {
            const baseSrcDir = this.const.resource_base + '/temp_comp/' + fileCompName;

            const finalDescDir = baseDestDir + '/' + fileCompName;
            if (!existsSync(finalDescDir)) {
                mkdirSync(finalDescDir);
            }
            this.genFileService.scanDirFunc(baseSrcDir, finalDescDir, '');
        }

        this.conchFile.weaveModule(pageVO, fileMap);
        // =============================================
        const compMap = this.conchDao.getCompMap();

        // =============================================

        const pageSchemaObj = JSON.parse(pageVO.page_schema);

        const outerObj = {
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
                const curIndex = outerObj.indexCountMap[curNode.comp_code];
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
        const demoDataMap = {};

        const tmpPath = this.const.resource_base + '/data_demo';
        const dir = readdirSync(tmpPath);
        dir.forEach(function (item: any) {
            const filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (existsSync(filePath)) {
                const json_data = readFileSync(filePath, {encoding: 'utf-8'});
                fileObj = JSON.parse(json_data);
                demoDataMap[item.split('.')[0]] = fileObj;
            }
        });

        return demoDataMap;
    }

    queryModelAll() {
        const modelList = this.conchDao.getDataJsonByName('ud_model');
        return modelList;
    }

    queryCompAll() {

        const compList = this.conchDao.getDataJsonByName('ud_comp');

        return compList;
    }

    // =====================================

    private getFileCompRecu(treeNode, fileMap) {

        if (treeNode.comp_code == 'BaseInfo') {
            const tmpName = 'base-info';
            fileMap[tmpName] = 1;
        }
        if (treeNode.comp_code == 'Line') {
            const tmpName = 'chart';
            fileMap[tmpName] = 1;
        }
        if (treeNode.children && treeNode.children.length > 0) {
            for (let i = 0; i < treeNode.children.length; i++) {
                const childNode = treeNode.children[i];
                this.getFileCompRecu(childNode, fileMap);
            }
        }
    }

// =====================================

    syncTable(paramObj: any) {

        const table_name = paramObj.table_name;
        const comp_code = paramObj.comp_code;
        if (table_name == 'ud_comp') {
            this.syncCompTable(comp_code);
        } else {
            this.syncModelTable();
        }
    }

    async syncCompTable(comp_code) {
        const codeMap = {
            'BaseInfo': 1,
//            'Table': 1,
//            'Tree': 1,
        };

        const file_base = this.const.resource_base + '/data_table/ud_comp';

        const querySql = 'select * from ud_comp';
        const compList: any = await this.conchDao.queryTableAll(querySql);

        for (let i = 0; i < compList.length; i++) {
            const compObj = compList[i];
//            if (!codeMap[compObj.comp_code]) {
//                continue;
//            }

            const file_path = file_base + '/' + compObj.comp_code + '.json';
            writeFileSync(file_path, JSON.stringify(compObj));
        }
    }

    async syncModelTable() {

        const file_base = this.const.resource_base + '/data_table/ud_model';

        const querySql = 'select * from ud_model';
        const compList: any = await this.conchDao.queryTableAll(querySql);

        for (let i = 0; i < compList.length; i++) {
            const compObj = compList[i];

            const file_path = file_base + '/' + compObj.model_code + '.json';
            writeFileSync(file_path, JSON.stringify(compObj));
        }
    }

}
