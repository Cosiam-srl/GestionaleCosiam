import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StrumentiDiMisura } from 'app/models/strumentidimisura.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class StrumentiDiMisuraService extends DataService {
    strumenti: StrumentiDiMisura[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/StrumentiDiMisura';
    }

    getAllStrumentiDiMisura(queryParams?: HttpParams): Observable<StrumentiDiMisura[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<StrumentiDiMisura[]>);
    }
    postStrumentoDiMisura(attrezzo: StrumentiDiMisura): Observable<StrumentiDiMisura> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, attrezzo, {headers: authHeader}) as Observable<StrumentiDiMisura>
    }
    deleteStrumentoDiMisura(idStrumentoDiMisura: number): Observable<HttpResponse<Object>> {
    const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idStrumentoDiMisura, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }

    getStrumentoDiMisura(id: number): Observable<StrumentiDiMisura> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + id, {headers: authHeader}) as Observable<StrumentiDiMisura>
    }

    updateStrumento(strumento: StrumentiDiMisura): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/update/' + strumento.id, strumento, {headers: authHeader}) as Observable<HttpResponse<Object>>;
    }
}
