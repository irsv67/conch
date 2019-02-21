var os = require('os');
var Const = /** @class */ (function () {
    function Const() {
        this.resource_base = os.homedir() + '/_conch_res';
        this.home_path = os.homedir() + '/_conch_res/_runtime_data';
        this.runtime_tmp_path = os.homedir() + '/_conch_res/_runtime_tmp';
    }
    Const.prototype.guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return Const;
}());
export { Const };
//# sourceMappingURL=const.js.map