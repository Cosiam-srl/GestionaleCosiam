import { HttpClient, HttpRequest, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { DataService } from '../data/data.service';
import { AppConfigService } from './app-config.service';
import { Observable, catchError, throwError } from 'rxjs';

export class SystemParameter {
  key: string;
  value: string;
}


@Injectable({
  providedIn: 'root'
})
export class SystemParametersService extends DataService {

  constructor(private http: HttpClient, private _authService: AuthService) {
    super(http);
    this._url = AppConfigService.settings.apiServer.baseUrl + '/api/SystemParameters';
  }

  getByKey(key: string): Observable<SystemParameter | null> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get<SystemParameter | null>(`${this._url}/getByKey/${key}`, { headers: authHeader })
      .pipe(catchError((err) => { console.error(err); return throwError(() => err); }));
  }
  createOrUpdateParam(obj: SystemParameter): Observable<HttpResponse<any>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post<HttpResponse<any>>(`${this._url}/createOrUpdate`, obj, { headers: authHeader, observe: 'response' });
  }
  deleteParam(key: string): Observable<HttpStatusCode> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get<HttpStatusCode>(`${this._url}/deleteByKey/${key}`, { headers: authHeader });
  }
}
