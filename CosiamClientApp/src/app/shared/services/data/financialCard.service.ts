import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatiFinanziari } from 'app/models/cantiere.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class FinancialCardService extends DataService {
    datiFInanziari: DatiFinanziari[] = [];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/FinancialCard';
    }

    postFinancialCard(datiFinanziari: DatiFinanziari): Observable<HttpResponse<string>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this._url + '/' + datiFinanziari.id + '/Update', datiFinanziari, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<string>>
    }
    getFinancialCard(idFinancialCard): Observable<DatiFinanziari> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url + '/' + idFinancialCard, { headers: authHeader }) as Observable<DatiFinanziari>
    }
    getAllFinancialCards(): Observable<DatiFinanziari[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url, { headers: authHeader }) as Observable<DatiFinanziari[]>
    }
    // solo quando viene creato un nuovo cantiere
    createFinancialCard(datiFinanziari: DatiFinanziari): Observable<DatiFinanziari> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this._url, datiFinanziari, { headers: authHeader }) as Observable<DatiFinanziari>
    }
    //scarica il cashflow di un cantiere
    getCashFlow(idCantiere: number): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(`${AppConfigService.settings.apiServer.baseUrl}/api/Cantiere/${idCantiere}/FinancialCard/Cashflow`, { headers: authHeader }) as Observable<number>;
    }
}
