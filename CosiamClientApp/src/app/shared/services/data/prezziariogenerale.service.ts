import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServizioCliente, PrezziarioGenerale } from 'app/models/benieservizi.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class PrezziarioGeneraleService extends DataService {

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/PrezziarioCliente';
    }


    getAllPrezziariGenerali(): Observable<PrezziarioGenerale[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader) as Observable<PrezziarioGenerale[]>);
    };
    getPrezziarioGenerale(idPrezziarioGenerale: number): Observable<PrezziarioGenerale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url + '/' + idPrezziarioGenerale, { headers: authHeader }) as Observable<PrezziarioGenerale>
    }
    getPrezzariGenerali(idsPrezzariGenerali: number[]): Observable<PrezziarioGenerale[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this._url + '/getMultiple', idsPrezzariGenerali, { headers: authHeader }) as Observable<PrezziarioGenerale[]>
    }

    postPrezziarioGenerale(prezziariogenerale: PrezziarioGenerale): Observable<PrezziarioGenerale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, prezziariogenerale, { headers: authHeader }) as Observable<PrezziarioGenerale>
    };
    updatePrezziario(idPrezziario: number, prezzario: PrezziarioGenerale): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Update/' + idPrezziario, prezzario, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    deletePrezziario(idPrezziario: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idPrezziario, null, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }

}
