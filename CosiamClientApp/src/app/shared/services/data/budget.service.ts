import {Injectable} from '@angular/core';
import {DataService} from './data.service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {AppConfigService} from '../configs/app-config.service';
import {AttachmentsBudget, AttivitaBudgetModel, BudgetModel, CapitoloModel} from 'app/models/budget.model';
import {AuthService} from 'app/shared/auth/auth.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BudgetService extends DataService {

  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    super(_httpClient);
    this._url = AppConfigService.settings.apiServer.baseUrl + '/api/Budget';
  }

  getBudgetByCantiereId(idCantiere: number): Observable<HttpResponse<BudgetModel>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.get<BudgetModel>(this.url + "/" + idCantiere, {headers: authHeader, observe: 'response'});
  }

  /** Utilizzato per creazione/update */
  postBudget(budget: BudgetModel): Observable<HttpResponse<BudgetModel>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.post<BudgetModel>(this.url, budget, {headers: authHeader, observe: 'response'})
  }

  deleteCapitolo(capitolo: CapitoloModel): Observable<HttpResponse<any>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.post<any>(`${this.url}/deleteCapitoli`, [capitolo.id], {
      headers: authHeader,
      observe: 'response'
    })
  }

  deleteAttivita(attivita: AttivitaBudgetModel): Observable<HttpResponse<any>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.post<any>(`${this.url}/deleteAttivita`, [attivita.id], {
      headers: authHeader,
      observe: 'response'
    })
  }

  postAttachment(isAttivita: number, fileAllegato: FormData): Observable<HttpResponse<any>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.post(this.url + '/postBudgetAttachments/' + isAttivita, fileAllegato, {headers: authHeader}) as Observable<HttpResponse<any>>
  }

  getAttachment(isBudget: number): Observable<HttpResponse<AttachmentsBudget[]>> {
    const authHeader = this._authService.retrieveHeaders();
    return this._httpClient.get(this.url + '/getBudgetAttachments/' + isBudget, {
      headers: authHeader,
      observe: "response"
    }) as Observable<HttpResponse<any>>
  }

}
