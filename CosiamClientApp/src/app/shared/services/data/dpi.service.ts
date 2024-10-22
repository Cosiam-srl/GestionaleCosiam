import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dpi } from 'app/models/dpi.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class DpiService extends DataService {
    dpi: Dpi[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/DPI';
    }

    getAllDpi(queryParams?: HttpParams): Observable<Dpi[]> {
        const authHeader = this._authService.retrieveHeaders()
        return (this.get(authHeader, queryParams) as Observable<Dpi[]>);
    }
    getDpi(id: number): Observable<Dpi> {
        const authHeader = this._authService.retrieveHeaders()
        return this.http.get(this.url + '/' + id, {headers: authHeader}) as Observable<Dpi>
    }
    postDpi(attrezzo: Dpi): Observable<Dpi> {
        const authHeader = this._authService.retrieveHeaders()
        return this.http.post(this.url, attrezzo, {headers: authHeader}) as Observable<Dpi>
    }
    deleteDpi(idDpi: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders()
        return this.http.post(this.url + '/Delete/' + idDpi, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    updateDpi(dpi: Dpi): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders()
        return this.http.post(this.url + '/update/' + dpi.id, dpi, {headers: authHeader}) as Observable<HttpResponse<Object>>;
    }
}
