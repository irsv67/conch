"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = require("mysql");
const fs_1 = require("fs");
const const_1 = require("./const");
class ConchDao {
    constructor() {
        this.connection = mysql_1.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'region'
        });
        this.const = new const_1.Const();
    }
    queryTableAll(sql) {
        console.log('Dao: ' + sql);
        const that = this;
        // 返回一个 Promise
        return new Promise((resolve, reject) => {
            that.connection.query(sql, (err, rows, fields) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    getCompMap() {
        let rows = this.getDataJsonByName('ud_comp');
        let compMap = {};
        for (let i = 0; i < rows.length; i++) {
            const obj = rows[i];
            compMap[obj.comp_code] = obj;
        }
        return compMap;
    }
    getDataJsonByName(tableName) {
        const that = this;
        let rows = [];
        let tmpPath = this.const.resource_base + '/data_table/' + tableName;
        let dir = fs_1.readdirSync(tmpPath);
        dir.forEach(function (item) {
            let filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (fs_1.existsSync(filePath)) {
                let json_data = fs_1.readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    }
    getDataListFromHome(tableName) {
        const that = this;
        let rows = [];
        let tmpPath = this.const.home_path + '/' + tableName;
        let dir = fs_1.readdirSync(tmpPath);
        dir.forEach(function (item) {
            let filePath = tmpPath + '/' + item;
            let fileObj = {};
            if (fs_1.existsSync(filePath)) {
                let json_data = fs_1.readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    }
}
exports.ConchDao = ConchDao;
//# sourceMappingURL=conch-dao.js.map