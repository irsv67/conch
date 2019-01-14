"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require('os');
class Const {
    constructor() {
        this.resource_base = os.homedir() + '/_conch_res';
        this.home_path = os.homedir() + '/_conch_res/_runtime_data';
        this.runtime_tmp_path = os.homedir() + '/_conch_res/_runtime_tmp';
    }
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
exports.Const = Const;
//# sourceMappingURL=const.js.map