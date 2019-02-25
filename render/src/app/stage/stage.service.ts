import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class StageService {

    base_url: any = 'http://localhost:3000';

    constructor(private http: HttpClient) {
    }

    getResourcePath() {
        const configUrl: any = this.base_url + '/express/getResourcePath';
        return this.http.post(configUrl, {});
    }
}
