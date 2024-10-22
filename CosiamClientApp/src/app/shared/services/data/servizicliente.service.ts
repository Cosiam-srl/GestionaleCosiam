import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServizioCliente } from 'app/models/benieservizi.model';
import { _File } from 'app/models/file.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';
// nel backend corrisponde a ServiziCliente
@Injectable({
    providedIn: 'root'
})
export class ServiziClienteService extends DataService {

    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/ServizioCliente';
    }


    getAllServiziCliente(idPrezziarioGenerale: number): Observable<ServizioCliente[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this.url + '/' + idPrezziarioGenerale, { headers: authHeader }) as Observable<ServizioCliente[]>;
    };
    // posto un nuovo servizio cliente
    postPrezziario(prezziario: ServizioCliente): Observable<ServizioCliente> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url, prezziario, { headers: authHeader }) as Observable<ServizioCliente>
    };
    // elimino un servizio cliente
    deletePrezziario(idPrezziari: number[]): Observable<HttpResponse<Object>> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Delete', idPrezziari, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
    }
    updateServizioCliente(servizioCliente: ServizioCliente): Observable<ServizioCliente> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this.url + '/Update/' + servizioCliente.id, servizioCliente, { headers: authHeader }) as Observable<ServizioCliente>
    }
    postFile(idPrezziarioGenerale: number, fileAllegato: FormData): Observable<_File[]> {
        const authHeader = this._authService.retrieveHeaders();
        const _param = new HttpParams()
            .set('idPrezziario', idPrezziarioGenerale.toString());
        return this.http.post(this.url + '/import', fileAllegato, { params: _param, headers: authHeader }) as Observable<_File[]>
    }

    cercaArticoloPrezzario(idPrezzarioGenerale: number[], search?: string, rateCode: boolean = false): Observable<ServizioCliente[]> {
        const authHeader = this._authService.retrieveHeaders();
        // { id: number, description: string }
        let _param = new HttpParams();
        if (search) {
            _param = _param.set('searchString', search);
        }
        if (rateCode) {
            _param = _param.append('isRateCode', 'true');
            // .set('searchString', search)
        }
        // let ids:string;
        // idPrezzarioGenerale.map(x=>ids.concat(x.toString(),','))
        // _param = _param.append('idPrezzariCliente', JSON.stringify(idPrezzarioGenerale))

        return this.http.post(this.url + '/cercaprezziV2', idPrezzarioGenerale, { params: _param, headers: authHeader }) as Observable<ServizioCliente[]>
    }


}
