import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Note } from 'app/models/note.model';
import { Personale } from 'app/models/personale.model';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';
import { TaggedNota } from 'app/models/taggednota.model';
import { _File } from 'app/models/file.model';
import { AuthService } from 'app/shared/auth/auth.service';

@Injectable({
    providedIn: 'root'
})

export class NoteService extends DataService {

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/Note';
    }

    // ritorna tutte le note
    getAllNote(queryParams?: HttpParams): Observable<Note[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader, queryParams) as Observable<Note[]>);
    }
    getNota(idNota): Observable<Note> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idNota, { headers: authHeader }) as Observable<Note>
    }
    // posta il personale responsabile della nota. Serve per taggare la nota ad una o piu persone
    // postResponsiblesToNote(id: number, idPersonale: number[]): Observable<TaggedNota> {
    postResponsiblesToNote(id: number, idPersonale: number[]): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostResponsiblesToNote/' + id, idPersonale, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    getAttachmentsNota(idNota): Observable<_File[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/Attachments?Id=' + idNota, { headers: authHeader }) as Observable<_File[]>
    }
    postAttachmentsToNote(idNota: number, fileAllegato: FormData): Observable<_File[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/PostAttachmentsToNote/' + idNota, fileAllegato, { headers: authHeader }) as Observable<_File[]>
    }
    // tecnicamente è inutile perchè il modello TaggedNota contiene già il personale taggato
    getPersonaleTaggato(idnota: number): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Tags/' + idnota, null, { headers: authHeader }) as Observable<Object>
    }

    /**
     * Funzione per eliminare una o più note
     *
     * @param elements array di id delle note da cancellare
     * @returns il numero di note eliminate
     */
    deleteNote(elements: number[]): Observable<number> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(AppConfigService.settings.apiServer.baseUrl + '/DeleteMultipleNotes/', elements, { headers: authHeader }) as Observable<number>
    }

    postReplyNota(idNota: number, nota: Note): Observable<Note[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(AppConfigService.settings.apiServer.baseUrl + '/api/commenti/' + idNota, nota, { headers: authHeader }) as Observable<Note[]>
    }
    getReplyNota(idNota: number): Observable<Note[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(AppConfigService.settings.apiServer.baseUrl + '/api/commenti/' + idNota, {headers:authHeader}) as Observable<Note[]>
    }
}
