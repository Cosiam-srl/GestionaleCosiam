import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contratto } from 'app/models/contratto.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class ContrattoService extends DataService {
    contratti: Contratto[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/Contratto';
    }

    getAllContratti(queryParams?: HttpParams): Observable<Contratto[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Contratto[]>);
    }
    getContratto(idContratto): Observable<Contratto> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idContratto, {headers: authHeader}) as Observable<Contratto>
    }
    postContratto(contratto: Contratto): Observable<Contratto> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, contratto, {headers: authHeader}) as Observable<Contratto>
    }
    deleteContratto(idContratto: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idContratto, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    updateContratto(idContratto: number, contratto: Contratto): Observable<Contratto> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Update/' + idContratto, contratto, {headers: authHeader}) as Observable<Contratto>
    }
}
