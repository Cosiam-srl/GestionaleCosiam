import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';
import { AvanzamentoTemporaleCantiere, Cantiere } from 'app/models/cantiere.model';
import { Note } from 'app/models/note.model';
import { Weather } from 'app/models/weather.model';
import { TaggedNota } from 'app/models/taggednota.model';
import { Personale } from 'app/models/personale.model';
import { _File } from 'app/models/file.model';
import { LoggingService, LogLevel } from '../logging/logging.service';
import { ListaPersonaleAssegnatoDiCantiere } from 'app/models/assegnamentoPersonale.model';
import { ListaMezziDiCantiere } from 'app/models/listaMezziDiCantiere.model';
import { Supplier } from 'app/models/supplier.model';
import { ObservedValueOf } from 'rxjs';
import { Data } from '@angular/router';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { AuthService } from 'app/shared/auth/auth.service';
import { ReportModel, reportShortModel } from 'app/shared/components/report/report.component';
import { BudgetModel } from 'app/models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class CantieriService extends DataService {
  cantieri: Cantiere[] = [];

  constructor(private http: HttpClient, private _authService: AuthService) {
    super(http);
    this._url = AppConfigService.settings.apiServer.baseUrl + '/api/cantiere';
  }

  getCantieri(queryParams?: HttpParams): Observable<Cantiere[]> {
    const authHeader = this._authService.retrieveHeaders();
    return (this.get(authHeader, queryParams) as Observable<Cantiere[]>);
  }

  getCantiere(id: number, queryParams?: HttpParams): Observable<Cantiere> {
    const authHeader = this._authService.retrieveHeaders();
    return this.getElement(id, authHeader, queryParams) as Observable<Cantiere>
  }

  createCantiere(model: Cantiere): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url, model, { headers: authHeader }) as Observable<number>
  }
  deleteCantiere(idCantiere: number): Observable<HttpResponse<Object>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/Delete/' + idCantiere, null, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<Object>>
  }
  updateCantiere(cantiere: Cantiere): Observable<HttpResponse<Object>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/UpdateCantiere', cantiere, { headers: authHeader }) as Observable<HttpResponse<Object>>
  }
  getPMsCantiere(idCantiere: number): Observable<Personale[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/PMs/' + idCantiere, { headers: authHeader }) as Observable<Personale[]>
  }
  postPMsCantiere(ids: number[], idCantiere: number): Observable<Object> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/PMs/' + idCantiere, ids, { headers: authHeader }) as Observable<Object>
  }
  updatePMCantiere(idCantiere: number, idsPM: number[]): Observable<HttpResponse<Object>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/UpdatePMs/' + idCantiere, idsPM, { headers: authHeader }) as Observable<HttpResponse<Object>>
  }
  getForemenCantiere(idCantiere: number): Observable<Personale[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/Foremen/' + idCantiere, { headers: authHeader }) as Observable<Personale[]>
  }
  postForemen(ids: number[], idCantiere: number): Observable<Object> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/Foremen/' + idCantiere, ids, { headers: authHeader }) as Observable<Object>
  }
  updateForemenCantiere(idCantiere: number, idForemen: number[]): Observable<HttpResponse<Object>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/UpdateForemen/' + idCantiere, idForemen, { headers: authHeader }) as Observable<HttpResponse<Object>>
  }

  /**
   * Funzione per recuperare tutti i dati di un signolo cantiere
   *
   * @param id Id del cantiere di cui recuperare i dati
   * @returns ritorna i dati di un cantiere con i dettagli
   */
  getCantiereFullSpecification(id: number): Observable<Cantiere> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/' + id, { headers: authHeader }) as Observable<Cantiere>
  }
  getNoteDiCantiere(id: number): Observable<TaggedNota[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/TaggedNoteDiCantiere/' + id, { headers: authHeader }) as Observable<TaggedNota[]>
  }

  //usata nella main-dashboard
  //scarica tutte le note per priorità
  getAllNotesByPriority(onlyTagged?: boolean): Observable<Note[]> {
    const authHeader = this._authService.retrieveHeaders();
    var param;
    if (onlyTagged)
      param = new HttpParams().set('onlyTagged', 'true');
    return this.http.get(this.url + "/AllNotesByPriority", { headers: authHeader, params: param }) as Observable<Note[]>;

  }
  getAvanzamentoTemporale(idCantiere: number): Observable<AvanzamentoTemporaleCantiere> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/' + idCantiere + '/Days', { headers: authHeader }) as Observable<AvanzamentoTemporaleCantiere>
  }

  getOreCantieri(idCantieri: number[], dateFrom?: string, dateTo?: string): Observable<{ oreOrdinarie: number, oreStraordinarie: number, oreSpostamento: number }> {
    const authHeader = this._authService.retrieveHeaders();
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    return this.http.post<{ oreOrdinarie: number, oreStraordinarie: number, oreSpostamento: number }>(
      `${this.url}/getOreCantieri`,
      idCantieri,
      { headers: authHeader, params: params }
    );
  }

  getCostiMezziManodoperaMaterialiCantieri(idCantieri: number[], dateFrom?: string, dateTo?: string): Observable<{ costiManodopera: number, costiMezzi: number, costiMateriali: number }> {
    const authHeader = this._authService.retrieveHeaders();
    let params = new HttpParams();
    if (dateFrom) {
      params = params.set('dateFrom', dateFrom);
    }
    if (dateTo) {
      params = params.set('dateTo', dateTo);
    }
    return this.http.post<{ costiMezzi: number, costiManodopera: number, costiMateriali: number }>(
      `${this.url}/getCostiMezziManodoperaMaterialiCantieri`,
      idCantieri,
      { headers: authHeader, params: params }
    );
  }

  getLatLongMeteo(cap: number): Observable<{ name: string, lat: number, lon: number, country: string }> {
    // VECCHIA API
    // return this.http.get("https://api.openweathermap.org/geo/1.0/direct?q=" + cap + ",IT&appid=bbc033edcec7cfd2702f33694b97570b") as Observable<{ name: string, lat: number, lon: number, country: string }[]>

    // NUOVA API
    return this.http.get('https://api.openweathermap.org/geo/1.0/zip?zip=' + cap + ',IT&appid=bbc033edcec7cfd2702f33694b97570b') as Observable<{ name: string, lat: number, lon: number, country: string }>
  }
  getmeteo(lat: number, lon: number): Observable<any> {
    // const authHeader = this._authService.retrieveHeaders();
    // http://api.openweathermap.org/geo/1.0/direct?q=41100,IT&appid=bbc033edcec7cfd2702f33694b97570b
    return this.http.get('https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=current,hourly,minutely,alerts&appid=bbc033edcec7cfd2702f33694b97570b&units=metric') as Observable<any>
  }
  postNotaDiCantiere(id: number, nota: Note): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/PostNotaDiCantiere/' + id, nota, { headers: authHeader }) as Observable<number>
  }
  updateNotaDiCantiere(idCantiere: number, nota: TaggedNota): Observable<TaggedNota> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/UpdateNotaDiCantiere/' + idCantiere, nota, { headers: authHeader }) as Observable<TaggedNota>
  }
  // ritorna un array di personale
  getPersonaleCantiere(id: number): Observable<Personale[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/ListaPersonaleAssegnato/' + id, { headers: authHeader }) as Observable<Personale[]>
  }
  // ritorna una lista assegmanenti
  getListaPersonaleCantiere(idCantiere: number): Observable<ListaPersonaleAssegnatoDiCantiere[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/AssegnamentiPersonale/' + idCantiere, { headers: authHeader }) as Observable<ListaPersonaleAssegnatoDiCantiere[]>
  }
  // il number di ritorno indica il numero di personali postati al cantiere
  postPersonaleCantiere(idCantiere: number, idPersonale: number[], dataInizio: string, dataTermine: string): Observable<ListaPersonaleAssegnatoDiCantiere[]> {
    const authHeader = this._authService.retrieveHeaders();
    console.log(dataInizio);
    if (dataInizio != null && dataTermine != null) {
      return this.http.post(this.url + '/PersonaleAssegnato/' + idCantiere + '?fromDate=' + dataInizio + '&toDate=' + dataTermine, idPersonale, { headers: authHeader }) as Observable<ListaPersonaleAssegnatoDiCantiere[]>
    } else {
      return this.http.post(this.url + '/PersonaleAssegnato/' + idCantiere, idPersonale, { headers: authHeader }) as Observable<ListaPersonaleAssegnatoDiCantiere[]>;
    }
  }

  deletePersonaleCantiere(idCantiere: number, ids: number[]): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/DeleteMultiplePersonale/' + idCantiere, ids, { headers: authHeader }) as Observable<number>
  }

  postFileCantiere(idCantiere: number, file: FormData): Observable<any> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/File/' + idCantiere, file, {
      reportProgress: true,
      observe: 'events',
      headers: authHeader
    })
  }
  postReportHSECantiere(idCantiere: number, file: FormData): Observable<any> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/ReportHSE/' + idCantiere, file, {
      reportProgress: true,
      observe: 'events',
      headers: authHeader
    })
  }
  postFileCantiereUrl(idCantiere: number): string {
    return this.url + '/' + idCantiere + '/Files?type=fileGenerico';
  }
  postReportHSECantiereUrl(idCantiere: number): string {
    const authHeader = this._authService.retrieveHeaders();
    return this.url + '/' + idCantiere + '/Files?type=reportHSE';
  }



  getFileCantiere(idCantiere: number): Observable<_File[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/' + idCantiere + '/Files?type=fileGenerico', { headers: authHeader }) as Observable<_File[]>
  }
  getReportHSECantiere(idCantiere: number): Observable<_File[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/' + idCantiere + '/Files?type=reportHSE', { headers: authHeader }) as Observable<_File[]>
  }

  getImmaginiCantiere(idCantiere: number): Observable<String[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this._url + '/Images/' + idCantiere, { headers: authHeader }) as Observable<String[]>
  }

  getSingleImmagineCantiere(idCantiere: number, idImage: number): Observable<String> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this._url + '/Images/' + idCantiere + '/SingleImage/' + idImage, { headers: authHeader }) as Observable<String>
  }

  getMezziCAntiere(idCantiere: number): Observable<ListaMezziDiCantiere[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/MezziDiCantiere/' + idCantiere, { headers: authHeader }) as Observable<ListaMezziDiCantiere[]>
  }

  postMezziCantiere(idCantiere: number, idMezzi: number[], dataInizio: string, dataTermine: string): Observable<ListaMezziDiCantiere[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/MezziDiCantiere/' + idCantiere + '?fromDate=' + dataInizio + '&toDate=' + dataTermine, idMezzi, { headers: authHeader }) as Observable<ListaMezziDiCantiere[]>
  }

  deleteMezziCantiere(idCantiere: number, ids: number[]): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/DeleteMultipleMezzi/' + idCantiere, ids, { headers: authHeader }) as Observable<number>
  }

  getFornitoriCantiere(idCantiere: number): Observable<Supplier[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this.url + '/ListaFornitoriDiCantiere/' + idCantiere, { headers: authHeader }) as Observable<Supplier[]>
  }

  postFornitoriCantiere(idCantiere: number, idFornitori: number[]): Observable<Supplier[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/FornitoriDiCantiere/' + idCantiere, idFornitori, { headers: authHeader }) as Observable<Supplier[]>
  }

  deleteFornitoriCantiere(idCantiere: number, ids: number[]): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/DeleteMultipleFornitori/' + idCantiere, ids, { headers: authHeader }) as Observable<number>
  }
  getAvailabilityPersonaleCantiere(idPersonale: number[], fromDate: string, toDate: string): Observable<number[]> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url + '/GetPersonaleAvailability?fromDate=' + fromDate + '&toDate=' + toDate, idPersonale, { headers: authHeader }) as Observable<number[]>
  }

  // può ritornare una intera lista o un singolo report
  getReportDiCantiere(idCantiere: number, idReport?: number, dateFrom?: string, dateTo?: string, isDraft: boolean = false): Observable<reportShortModel[] | reportShortModel> {
    const authHeader = this._authService.retrieveHeaders();
    let _param = new HttpParams();
    if (idReport)
      _param = _param.set('idReport', idReport.toString())
    if (dateFrom)
      _param = _param.set('dateFrom', dateFrom);
    if (dateTo)
      _param = _param.set('dateTo', dateTo);
    if (isDraft)
      _param = _param.set('isDraft', 'true');


    return this.http.get(this._url + '/' + idCantiere + '/ReportDiCantiere', { params: _param, headers: authHeader }) as Observable<reportShortModel[] | reportShortModel>

  }
  // posta un report di cantiere privo di attachments. Usato per la CREAZIONE
  postReportDiCantiere(report: ReportModel, idCantiere: number): Observable<reportShortModel> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this._url + '/' + idCantiere + '/ReportDiCantiere', report, { headers: authHeader }) as Observable<reportShortModel>
  }
  // posta un report di cantiere privo di attachments. Usato per la MODIFICA
  updateReportDiCantiere(report: ReportModel, idCantiere: number, idReport: number): Observable<reportShortModel> {
    const authHeader = this._authService.retrieveHeaders();
    var _param = new HttpParams()
      .set('idReport', idReport.toString());
    return this.http.post(this._url + '/' + idCantiere + '/ReportDiCantiere/' + idReport + '/Update', report, { headers: authHeader, params: _param }) as Observable<reportShortModel>
  }
  deleteReportDiCantiere(idCantiere: number, idReport: number): Observable<HttpResponse<string>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this._url + '/' + idCantiere + '/DeleteReportDiCantiere/' + idReport, null, { observe: 'response', headers: authHeader }) as Observable<HttpResponse<string>>
  }
  /**
   * Scarica l'ultimo report di cantiere generato (in formato short)
   * @param idCantiere
   * @returns
   */
  getLastReportDiCantiere(idCantiere: number): Observable<HttpResponse<reportShortModel>> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this._url + '/' + idCantiere + '/GetLastReportDiCantiere', { observe: 'response', headers: authHeader }) as Observable<HttpResponse<reportShortModel>>
  }
  //scarico un report di cantiere e popolo il wizard
  getReportFullSpec(idCantiere: number, idReport: number): Observable<ReportModel> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this._url + '/' + idCantiere + '/ReportDiCantiere/' + idReport, { headers: authHeader }) as Observable<ReportModel>
  }

  getReportSomma(idReport: number, idCantiere: number, datefrom: string, dateTo: string, mostraCosti: boolean, mostraRicavi: boolean, mostraFoto: boolean, reportCompleto: boolean, reportSingolo: boolean) {
    const authHeader = this._authService.retrieveHeaders();
    var _param = new HttpParams()
      .set('idReport', idReport)
      .set('dateFrom', datefrom)
      .set('dateTo', dateTo)
      .set('mostraCosti', mostraCosti)
      .set('mostraRicavi', mostraRicavi)
      .set('mostraFoto', mostraFoto)
      .set('reportCompleto', reportCompleto)
      .set('reportSingolo', reportSingolo);
    return this.http.get(this._url + '/' + idCantiere + '/SummaryReport', { headers: authHeader, params: _param }) as Observable<ReportModel>

  }

  getAttachmentsReport(idCantiere: number, idReport: number, reportType?: string): Observable<_File[]> {
    const authHeader = this._authService.retrieveHeaders();
    let _params = null;
    if (reportType) {
      _params = new HttpParams()
        .set('reportType', reportType)
    }
    return this.http.get(this._url + '/' + idCantiere + '/ReportAttachments/' + idReport, { params: _params, headers: authHeader }) as Observable<_File[]>
  }
  postReportAttachments(idCantiere: number, idReport: number, file: FormData, reportTypeFile: string, cantiereFileType?: string): Observable<File[]> {
    const authHeader = this._authService.retrieveHeaders();
    if (!cantiereFileType) {
      cantiereFileType = 'Report di Cantiere';
    }

    const _params = new HttpParams()
      .set('reportFileType', reportTypeFile)
      .set('cantiereFileType', cantiereFileType)

    return this.http.post(this.url + '/' + idCantiere + '/ReportAttachments/' + idReport, file, { params: _params, reportProgress: true, headers: authHeader }) as Observable<File[]>
  }

  // usata per ottenere il prezzo del carburante scritto nell'ultimo report
  getLatestFuelPrice(idCantiere: number): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.get(this._url + '/' + idCantiere + '/Report/LatestFuelPrice', { headers: authHeader }) as Observable<number>
  }

  // usato sia per l'avanzamento produzione sia per il VALORE DELLA PRODUZIONE
  getAvanzamentoProduzione(idCantiere: number, valoreDellaProduzione?: boolean, beginDate?: string, endDate?: string): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    if (valoreDellaProduzione) {
      const _params = new HttpParams().set('EvaluateSals', 'true');
      // scarico il valore della produzione
      return this.http.get(this._url + '/' + idCantiere + '/AvanzamentoProduzione', { params: _params, headers: authHeader }) as Observable<number>
    }
    // scarico i ricavi consuntivi della tabella budget in cantieri dashboard
    if (beginDate && endDate) {
      const _params = new HttpParams()
        .set('beginDate', beginDate)
        .set('endDate', endDate);
      return this.http.get(this._url + '/' + idCantiere + '/AvanzamentoProduzione', { params: _params, headers: authHeader }) as Observable<number>
    }
    // scarico l'avanzamento produzione
    return this.http.get(this._url + '/' + idCantiere + '/AvanzamentoProduzione', { headers: authHeader }) as Observable<number>
  }

  // scarico i costi consuntivi della tabella budget in cantieri dashboard
  getCostiConsuntiviBudget(idCantiere: number, beginDate: string, endDate: string): Observable<number> {
    const authHeader = this._authService.retrieveHeaders();
    const _params = new HttpParams()
      .set('beginDate', beginDate)
      .set('endDate', endDate);
    return this.http.get(this._url + '/' + idCantiere + '/Spese', { params: _params, headers: authHeader }) as Observable<number>
  }

}
