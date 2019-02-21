import { createConnection } from 'mysql';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { Const } from './const';
var ConchDao = /** @class */ (function () {
    function ConchDao() {
        this.connection = createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'region'
        });
        this.const = new Const();
    }
    ConchDao.prototype.queryTableAll = function (sql) {
        console.log('Dao: ' + sql);
        var that = this;
        // 返回一个 Promise
        return new Promise(function (resolve, reject) {
            that.connection.query(sql, function (err, rows, fields) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    };
    ConchDao.prototype.getCompMap = function () {
        var rows = this.getDataJsonByName('ud_comp');
        var compMap = {};
        for (var i = 0; i < rows.length; i++) {
            var obj = rows[i];
            compMap[obj.comp_code] = obj;
        }
        return compMap;
    };
    ConchDao.prototype.getDataJsonByName = function (tableName) {
        var that = this;
        var rows = [];
        var tmpPath = this.const.resource_base + '/data_table/' + tableName;
        var dir = readdirSync(tmpPath);
        dir.forEach(function (item) {
            var filePath = tmpPath + '/' + item;
            var fileObj = {};
            if (existsSync(filePath)) {
                var json_data = readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    };
    ConchDao.prototype.getDataListFromHome = function (tableName) {
        var that = this;
        var rows = [];
        var tmpPath = this.const.home_path + '/' + tableName;
        var dir = readdirSync(tmpPath);
        dir.forEach(function (item) {
            var filePath = tmpPath + '/' + item;
            var fileObj = {};
            if (existsSync(filePath)) {
                var json_data = readFileSync(filePath, { encoding: 'utf-8' });
                fileObj = JSON.parse(json_data);
                rows.push(fileObj);
            }
        });
        return rows;
    };
    return ConchDao;
}());
export { ConchDao };
//# sourceMappingURL=conch-dao.js.map