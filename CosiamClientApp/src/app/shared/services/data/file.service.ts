import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';
import { _File } from 'app/models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService extends DataService {

  constructor(private http: HttpClient, private _authService: AuthService) {
    super(http);
    this._url = AppConfigService.settings.apiServer.baseUrl + '/api/file';
  }

  downloadFile(file: _File) {
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

  deleteFiles(ids: number[]): Observable<number> {
    const authHeader = this._authService.retrieveHeaders()
    return this.http.post(this._url + '/deleteMultiple', ids, {headers: authHeader}) as Observable<number>
  }
}
