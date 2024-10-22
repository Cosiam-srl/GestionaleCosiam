import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cantiere } from 'app/models/cantiere.model';
import { _File } from 'app/models/file.model';
import { Personale, ScadenzePersonale } from 'app/models/personale.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { reportShortModel } from 'app/shared/components/report/report.component';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

export class TimeCardPersonale {
    id: number;
    numberOfHours: 10;
    type: number;
    beginningDate: string;
    endDate: string;
    personaleId: number;
    personale: Personale;
    idReport: number;
    reportDiCantiere: reportShortModel
}

@Injectable({
    providedIn: 'root'
})

export class PersonaleService extends DataService {
    personale: Personale[] = [];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/personale';
    }


    getAllPersonale(queryParams?: HttpParams): Observable<Personale[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Personale[]>);
    }
    getPersonale(idPersonale: number): Observable<Personale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idPersonale, { headers: authHeader }) as Observable<Personale>;
    }
    /**
     * 
     * @param username username dello user
     * @returns 
     */
    getPersonaleFromUserName(username: string): Observable<Personale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/getPersonaleFromUsername/' + username, { headers: authHeader }) as Observable<Personale>;
    }
    postPersonale(personale: Personale): Observable<Personale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, personale, { headers: authHeader }) as Observable<Personale>
    }
    deletePersonale(idPersonale: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idPersonale, null, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    updatePersonale(personale: Personale, canLogin: boolean): Observable<Personale> {
        const authHeader = this._authService.retrieveHeaders();
        var _param = new HttpParams();
        _param = _param.append('canLogin', canLogin.toString());
        _param = _param.append('role', personale.role);
        return this.http.post(this.url + '/UpdatePersonale', personale, { headers: authHeader, params: _param }) as Observable<Personale>
    }
    // ritorna una lista di cantieri in cui un determinato membro del personale è occupato
    getCantieriPersonale(idPersonale: number): Observable<Cantiere[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idPersonale + '/Cantieri', { headers: authHeader }) as Observable<Cantiere[]>
    }

    // scadenze personale(tabelle presenti nella dashboard del personale)
    getScadenzePersonale(idPersonale: number): Observable<ScadenzePersonale[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idPersonale + '/Scadenze', { headers: authHeader }) as Observable<ScadenzePersonale[]>;
    }
    // scadenze personale(tabelle presenti nella dashboard del personale)
    getScadenzePersonaleFiltered(idPersonale: number, includiScadenzechiuse?: boolean, stato?: string, giorniAllaScadenza?: number,): Observable<ScadenzePersonale[]> {
        const authHeader = this._authService.retrieveHeaders();
        if (includiScadenzechiuse == null) {
            // di default non richiedo mai le scadenze chiuse perchè non servono
            includiScadenzechiuse = false;
        }
        if (stato == null && giorniAllaScadenza != null) {
            return this.http.get(this.url + '/' + idPersonale + '/Scadenze?daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzePersonale[]>;
        } else if (giorniAllaScadenza == null && stato != null) {
            return this.http.get(this.url + '/' + idPersonale + '/Scadenze?state=' + stato + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzePersonale[]>;
        } else if (giorniAllaScadenza == null && stato == null) {
            return this.http.get(this.url + '/' + idPersonale + '/Scadenze?includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzePersonale[]>;
        } else {
            return this.http.get(this.url + '/' + idPersonale + '/Scadenze?state=' + stato + '&daysToGo=' + giorniAllaScadenza + '&includeClosed=' + includiScadenzechiuse, { headers: authHeader }) as Observable<ScadenzePersonale[]>;
        }
    }
    postScadenzaPersonale(scadenzaPersonale): Observable<ScadenzePersonale> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostScadenza', scadenzaPersonale, { headers: authHeader }) as Observable<ScadenzePersonale>
    }
    deleteScadenzePersonale(elements: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/DeleteScadenze/', elements, { headers: authHeader }) as Observable<number>
    }
    changeScadenzaStatus(idScadenza: number, stato: string): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        var params = new HttpParams();
        params = params.append('new_state', stato);

        return this.http.post(this.url + '/ChangeScadenzaStatus/' + idScadenza, null, { headers: authHeader, params: params }) as Observable<number>
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


    // ore di lavoro nella dashboard
    getTimeCardsPersonale(idPersonale, beginningDate: string = '', endDate: string = ''): Observable<TimeCardPersonale[]> {
        const authHeader = this._authService.retrieveHeaders();
        let _params;

        if (beginningDate != '' && endDate != '') {
            _params = new HttpParams()
                .set('beginningDate', beginningDate)
                .set('endingDate', endDate)
                .set('sum', 'true')
        } else if (beginningDate != '' && endDate == '') {
            _params = new HttpParams()
                .set('beginningDate', beginningDate)
                .set('sum', 'true')
        } else if (beginningDate == '' && endDate != '') {
            _params = new HttpParams()
                .set('endingDate', endDate)
                .set('sum', 'true')
        } else {
            _params = new HttpParams()
                .set('sum', 'true')
        }
        return this.http.get(this._url + '/' + idPersonale + '/TimeCards', { params: _params, headers: authHeader }) as Observable<TimeCardPersonale[]>
    }

    emailExists(email: string): Observable<boolean> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/EmailExists/' + email, null, { headers: authHeader }) as Observable<boolean>
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

    checkPersonaleEmail(emailPersonale: string): Observable<boolean> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get<boolean>(`${this.url}/checkPersonaleEmail/${emailPersonale}`, { headers: authHeader })
    }


    estraiDatiPersonale(idsPersonale: number[], exportType: 'pdf' | 'xlsx', dateFrom?: Date, dateTo?: Date,) {
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
        return this.http.post(this.url + '/getDettagliPersonale', idsPersonale,
            { headers: authHeaders, observe: 'response', params: _params, responseType: 'arraybuffer' })

    }

    estraiDatiPersonaleMultiple(idsPersonale: number[], dateFrom?: Date, dateTo?: Date) {
        const authHeaders = this._authService.retrieveHeaders();

        let _params = new HttpParams();
        if (dateFrom) {
            _params = _params
                .append('dateFrom', dateFrom.toString())
        }
        if (dateTo) {
            _params = _params
                .append('dateTo', dateTo.toString())
        }
        return this.http.post(this.url + '/getDettagliPersonaleMultiple', idsPersonale,
            { headers: authHeaders, observe: 'body', params: _params, responseType: 'arraybuffer' })

    }
}
