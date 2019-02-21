import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ModelEditorService {

    base_url: any = 'http://localhost:3000';

    constructor(private http: HttpClient) {
    }

    public getModelTree() {
        const configUrl: any = this.base_url + '/express/getModelTree';
        return this.http.post(configUrl, {});
    }

    public saveModel(modelObj) {
        const configUrl: any = this.base_url + '/express/saveModel';
        return this.http.post(configUrl, modelObj);
    }

}
