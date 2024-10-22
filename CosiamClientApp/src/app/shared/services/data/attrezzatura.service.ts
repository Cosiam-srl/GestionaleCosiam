import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Attrezzatura } from 'app/models/attrezzatura.model';
import { _File } from 'app/models/file.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})

export class AttrezzaturaService extends DataService {
    attrezzi: Attrezzatura[];

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/AttrezzaturaAT';
    }

    getAllAttrezzatura(queryParams?: HttpParams): Observable<Attrezzatura[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Attrezzatura[]>);
    }
    getAttrezzo(idAttrezzo: number): Observable<Attrezzatura> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idAttrezzo, {headers: authHeader}) as Observable<Attrezzatura>
    }
    postAttrezzo(attrezzo: Attrezzatura): Observable<Attrezzatura> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, attrezzo, {headers: authHeader}) as Observable<Attrezzatura>
    }
    deleteAttrezzo(idAttrezzo: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idAttrezzo, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    updateAttrezzo(attrezzo: Attrezzatura): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/update/' + attrezzo.id, attrezzo, {headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    postAttachments(idAttrezzo: number, fileAllegato: FormData): Observable<_File[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostAttachmentsToAttrezzatura/' + idAttrezzo, fileAllegato, {headers: authHeader}) as Observable<_File[]>
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
