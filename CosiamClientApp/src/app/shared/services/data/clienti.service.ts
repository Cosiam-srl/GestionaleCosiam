import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cliente } from 'app/models/cliente.model';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';
import { AuthService } from 'app/shared/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ClientiService extends DataService {

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/clienti';
    }

    getAllClienti(): Observable<Cliente[]> {
        const authHeader = this._authService.retrieveHeaders();
        return (this.get(authHeader) as Observable<Cliente[]>);
    };
    postCliente(cliente: Cliente): Observable<Cliente> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, cliente, {headers: authHeader}) as Observable<Cliente>
    }
    deleteCliente(idCliente: number): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete/' + idCliente, null, { observe: 'response', headers: authHeader}) as Observable<HttpResponse<Object>>
    }
    getCliente(id: number): Observable<Cliente> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + id, {headers: authHeader}) as Observable<Cliente>
    }
    updateCliente( cliente: Cliente): Observable<Cliente> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/UpdateClienti', cliente, {headers: authHeader}) as Observable<Cliente>
    }
}
