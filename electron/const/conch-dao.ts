import {createConnection} from 'mysql';
import {existsSync, readdirSync, readFileSync} from 'fs';
import {Const} from './const';

export class ConchDao {

    connection: any;
    const: Const;

    constructor() {
        this.connection = createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'region'
        });

        this.const = new Const();
    }

    queryTableAll(sql: any) {
        console.log('Dao: ' + sql);

        const that = this;

        // 返回一个 Promise
        return new Promise((resolve, reject) => {
            that.connection.query(sql, (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    public getCompMap() {
        const rows = this.getDataJsonByName('ud_comp');

        const compMap = {};
        for (let i = 0; i < rows.length; i++) {
            const obj = rows[i];
            compMap[obj.comp_code] = obj;
        }
        return compMap;
    }

    getDataJsonByName(tableName) {
        const that = this;

        const rows = [];

        const tmpPath = this.const.resource_base + '/data_table/' + tableName;
        const dir = readdirSync(tmpPath);
        dir.forEach(function (item) {
            const filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (existsSync(filePath)) {
                const json_data = readFileSync(filePath, {encoding: 'utf-8'});
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    }

    getDataListFromHome(tableName) {
        const that = this;

        const rows = [];

        const tmpPath = this.const.home_path + '/' + tableName;
        const dir = readdirSync(tmpPath);
        dir.forEach(function (item) {
            const filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (existsSync(filePath)) {
                const json_data = readFileSync(filePath, {encoding: 'utf-8'});
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    }

}
