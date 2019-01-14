const os = require('os');

export class Const {

    resource_base: any = os.homedir() + '/_conch_res';
    home_path: any = os.homedir() + '/_conch_res/_runtime_data';
    runtime_tmp_path: any = os.homedir() + '/_conch_res/_runtime_tmp';

    constructor() {

    }

    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}