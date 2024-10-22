import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cantiere } from 'app/models/cantiere.model';
import { _File } from 'app/models/file.model';
import { Mezzo, ScadenzeMezzo } from 'app/models/mezzo.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class MezziService extends DataService {

    mezzi: Mezzo[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/mezzi';
    }

    getAllMezzi(queryParams?: HttpParams): Observable<Mezzo[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Mezzo[]>);
    }
    postMezzo(mezzo: Mezzo): Observable<Mezzo> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, mezzo, { headers: authHeader }) as Observable<Mezzo>
    }
    deleteMezzo(idMezzo: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idMezzo, null, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    updateMezzo(mezzo: Mezzo): Observable<Mezzo> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/UpdateMezzi', mezzo, { headers: authHeader }) as Observable<Mezzo>
    }
    getMezzo(idMezzo: number): Observable<Mezzo> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url + '/' + idMezzo, { headers: authHeader }) as Observable<Mezzo>
    }
    // ritorna una lista di cantieri in cui un determinato membro del personale è occupato
    getCantieriMezzo(idMezzo: number): Observable<Cantiere[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idMezzo + '/Cantieri', { headers: authHeader }) as Observable<Cantiere[]>
    }
    // scadenze mezzo(tabelle presenti nella dashboard del mezzo)
    getScadenzeMezzo(idMezzo: number): Observable<ScadenzeMezzo[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idMezzo + '/Scadenze', { headers: authHeader }) as Observable<ScadenzeMezzo[]>;
    }
    // scadenze personale(tabelle presenti nella dashboard del personale)
    getScadenzeMezzoFiltered(idMezzo: number, includiScadenzechiuse?: boolean, stato?: string, giorniAllaScadenza?: number,): Observable<ScadenzeMezzo[]> {
        const authHeader = this._authService.retrieveHeaders();
        if (includiScadenzechiuse == null) {
            // di default non richiedo mai le scadenze chiuse perchè non servono
            includiScadenzechiuse = false;
        }
        if (stato == null && giorniAllaScadenza != null) {
            return this.http.get(this.url + '/' + idMezzo + '/Scadenze?daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzeMezzo[]>;
        } else if (giorniAllaScadenza == null && stato != null) {
            return this.http.get(this.url + '/' + idMezzo + '/Scadenze?state=' + stato + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzeMezzo[]>;
        } else if (giorniAllaScadenza == null && stato == null) {
            return this.http.get(this.url + '/' + idMezzo + '/Scadenze?includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzeMezzo[]>;
        } else {
            return this.http.get(this.url + '/' + idMezzo + '/Scadenze?state=' + stato + '&daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzeMezzo[]>;
        }
    }
    postScadenzaMezzo(scadenzaMezzo): Observable<ScadenzeMezzo> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostScadenza', scadenzaMezzo, { headers: authHeader }) as Observable<ScadenzeMezzo>
    }
    deleteScadenzeMezzo(elements: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/DeleteScadenze/', elements, { headers: authHeader }) as Observable<number>
    }
    changeScadenzaStatus(idScadenza: number, stato: string): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/ChangeScadenzaStatus/' + idScadenza + '?new_state=' + stato, null, { headers: authHeader }) as Observable<number>
    }
    updateScadenza(idScadenza: number, scadenza): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/UpdateScadenza/' + idScadenza, scadenza, { headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    postAttachmentScadenza(idScadenza: number, fileAllegato: FormData): Observable<{ file: _File, id: number, idFile: number, idNota: number }[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostAttachmentsToScadenza/' + idScadenza, fileAllegato, { headers: authHeader }) as Observable<{ file: _File, id: number, idFile: number, idNota: number }[]>
    }
    deleteAttachmentScadenza(ids: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/DeleteAttachmentsScadenza', ids, { headers: authHeader }) as Observable<number>
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

    estraiDatiMezzi(idsMezzi: number[], exportType: 'pdf' | 'xlsx', dateFrom?: Date, dateTo?: Date) {
        const authHeaders = this._authService.retrieveHeaders();

        let _params = new HttpParams();
        _params = _params.append('exportType', exportType);
        
        if (dateFrom) {
            _params = _params
                .append('dateFrom', dateFrom.toString())
        }
        if (dateTo) {
            _params = _params
                .append('dateTo', dateTo.toString())
        }
        return this.http.post(this.url + '/getDettagliMezzi', idsMezzi,
            { headers: authHeaders, observe: 'body', params: _params, responseType: 'arraybuffer' })

    }
}
