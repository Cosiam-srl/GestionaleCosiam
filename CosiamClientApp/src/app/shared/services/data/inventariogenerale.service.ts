import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InventarioGenerale } from 'app/models/inventariogenerale.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class InventarioGeneraleService extends DataService {
    InventarioGenerale: InventarioGenerale[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/InventarioGenerale';
    }

    getAllInventarioGenerale(queryParams?: HttpParams): Observable<InventarioGenerale[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<InventarioGenerale[]>);
    }
    getAttrezzo(idElemento: number): Observable<InventarioGenerale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idElemento, {headers: authHeader}) as Observable<InventarioGenerale>
    }
    postInventarioGenerale(attrezzo: InventarioGenerale): Observable<InventarioGenerale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, attrezzo, {headers: authHeader}) as Observable<InventarioGenerale>
    }
    deleteInventarioGenerale(idInventarioGenerale: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idInventarioGenerale, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    updateInventarioGenerale(inventarioGenerale: InventarioGenerale): Observable<InventarioGenerale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Update/' + inventarioGenerale.id, inventarioGenerale, {headers: authHeader}) as Observable<InventarioGenerale>
    }
}
