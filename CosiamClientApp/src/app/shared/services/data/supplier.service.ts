import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServizioFornitore } from 'app/models/benieservizi.model';
import { Cantiere } from 'app/models/cantiere.model';
import { _File } from 'app/models/file.model';
import { ScadenzeFornitore, Supplier } from 'app/models/supplier.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class SupplierService extends DataService {
    fornitori: Supplier[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/fornitori';
    }

    getAllFornitori(queryParams?: HttpParams): Observable<Supplier[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Supplier[]>);
    }
    getFornitore(idFornitore: number): Observable<Supplier> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idFornitore, {headers: authHeader}) as Observable<Supplier>
    }
    postFornitore(fonritore: Supplier): Observable<Supplier> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, fonritore, {headers: authHeader}) as Observable<Supplier>
    }
    deleteFornitore(idFornitore: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idFornitore, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    updateFornitore(fornitore: Supplier): Observable<Supplier> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/' + fornitore.id + '/Update', fornitore, {headers: authHeader}) as Observable<Supplier>
    }
    // ritorna una lista di cantieri in cui un determinato membro del personale è occupato
    getCantieriFornitore(idFornitore: number): Observable<Cantiere[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idFornitore + '/Cantieri', {headers: authHeader}) as Observable<Cantiere[]>
    }


    //////////////////////////////////////////////////////////////////////



    getServiziFornitore(idFornitore: number): Observable<ServizioFornitore[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(AppConfigService.settings.apiServer.baseUrl + '/api/ServizioFornitore/' + idFornitore, {headers: authHeader}) as Observable<ServizioFornitore[]>;
    }
    postServizioFornitore(servizio: ServizioFornitore): Observable<ServizioFornitore> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(AppConfigService.settings.apiServer.baseUrl + '/api/ServizioFornitore', servizio, {headers: authHeader}) as Observable<ServizioFornitore>;
    }
    deleteServiziFornitore(ids: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(AppConfigService.settings.apiServer.baseUrl + '/api/ServizioFornitore/Delete', ids, {headers: authHeader}) as Observable<number>;
    }
    updateServizioFornitore(servizio: ServizioFornitore, idServizio: number): Observable<ServizioFornitore> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(AppConfigService.settings.apiServer.baseUrl + '/api/ServizioFornitore/Update/' + idServizio, servizio, {headers: authHeader}) as Observable<ServizioFornitore>
    }
    getAllServizi(): Observable<ServizioFornitore[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(AppConfigService.settings.apiServer.baseUrl + '/api/ServizioFornitore', {headers: authHeader}) as Observable<ServizioFornitore[]>
    }

    //////////////////////////////////////////////////////////////////////////

    // scadenze fornitore(tabelle presenti nella dashboard del fornitore)
    getScadenzeFornitore(idFornitore: number): Observable<ScadenzeFornitore[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idFornitore + '/Scadenze', {headers: authHeader}) as Observable<ScadenzeFornitore[]>;
    }
    // scadenze personale(tabelle presenti nella dashboard del personale)
    getScadenzeFornitoreFiltered(idFornitore: number, includiScadenzechiuse?: boolean, stato?: string, giorniAllaScadenza?: number, ): Observable<ScadenzeFornitore[]> {
        const authHeader = this._authService.retrieveHeaders();
        if (includiScadenzechiuse == null) {
            // di default non richiedo mai le scadenze chiuse perchè non servono
            includiScadenzechiuse = false;
        }
        if (stato == null && giorniAllaScadenza != null) {
            return this.http.get(this.url + '/' + idFornitore + '/Scadenze?daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, {headers: authHeader}) as Observable<ScadenzeFornitore[]>;
        } else if (giorniAllaScadenza == null && stato != null) {
            return this.http.get(this.url + '/' + idFornitore + '/Scadenze?state=' + stato + '&includeClosed=' + includiScadenzechiuse, {headers: authHeader}) as Observable<ScadenzeFornitore[]>;
 } else if (giorniAllaScadenza == null && stato == null) {
            return this.http.get(this.url + '/' + idFornitore + '/Scadenze?includeClosed=' + includiScadenzechiuse, {headers: authHeader}) as Observable<ScadenzeFornitore[]>;
 } else {
            return this.http.get(this.url + '/' + idFornitore + '/Scadenze?state=' + stato + '&daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, {headers: authHeader}) as Observable<ScadenzeFornitore[]>;
 }
    }
    postScadenzaFornitore(scadenzaFornitore): Observable<ScadenzeFornitore> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostScadenza', scadenzaFornitore, {headers: authHeader}) as Observable<ScadenzeFornitore>
    }
    deleteScadenzeFornitore(elements: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/DeleteScadenze/', elements, {headers: authHeader}) as Observable<number>
    }
    changeScadenzaStatus(idScadenza: number, stato: string): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/ChangeScadenzaStatus/' + idScadenza + '?new_state=' + stato, null, {headers: authHeader}) as Observable<number>
    }
    updateScadenza(idScadenza: number, scadenza): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/UpdateScadenza/' + idScadenza, scadenza, {headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    postAttachmentScadenza(idScadenza: number, fileAllegato: FormData): Observable<{ file: _File, id: number, idFile: number, idNota: number }[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostAttachmentsToScadenza/' + idScadenza, fileAllegato, {headers: authHeader}) as Observable<{ file: _File, id: number, idFile: number, idNota: number }[]>
    }
    deleteAttachmentScadenza(ids: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/DeleteAttachmentsScadenza', ids, {headers: authHeader}) as Observable<number>
    }
    downloadAttachment(file: _File) {
        let authHeaders = this._authService.retrieveHeaders();
        this.http.get(file.url + "/" + file.id,
          { headers: authHeaders, observe: 'body', responseType: 'arraybuffer' })
          .subscribe(
            (res: any) => {
              let downloadLink = document.createElement('a');
              downloadLink.href = window.URL.createObjectURL(new Blob([res], { type: file.type }));
              downloadLink.download = file.fileName;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              window.URL.revokeObjectURL(downloadLink.href);
              document.body.removeChild(downloadLink);
            },
            (err) => {
              console.error(err);
            }
          );
    
    }
}
