import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _File } from 'app/models/file.model';
import { ListaSalFattureCantiere } from 'app/models/ListaSalFattureCantiere.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class SalFatturaService extends DataService {
    attrezzi: ListaSalFattureCantiere[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/Saltura';
    }
    getSalFattura(idFattura: number): Observable<ListaSalFattureCantiere> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idFattura, {headers: authHeader}) as Observable<ListaSalFattureCantiere>
    }
    getAllSalFatture(idCantiere: number): Observable<ListaSalFattureCantiere[]> {
        const authHeader = this._authService.retrieveHeaders();
        const _params = new HttpParams()
            .set('idCantiere', idCantiere.toString())
        return this.http.get(this.url, { params: _params, headers: authHeader}) as Observable<ListaSalFattureCantiere[]>
    }
    postFattura(fattura: ListaSalFattureCantiere): Observable<ListaSalFattureCantiere> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, fattura, {headers: authHeader}) as Observable<ListaSalFattureCantiere>
    }
    postAttachmentToFattura(idFattura: number, formdata: FormData): Observable<_File[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostAttachmentToSaltura/' + idFattura, formdata, {headers: authHeader}) as Observable<_File[]>
    }
    updateFattura(idFattura: number, fattura: ListaSalFattureCantiere): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Update/' + idFattura, fattura, {headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    deleteSalFattura(idFattura: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idFattura, null, {headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    getAttachmentsFattura(idFattura: number) {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/GetAttachments/' + idFattura, {headers: authHeader}) as Observable<_File[]>
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
