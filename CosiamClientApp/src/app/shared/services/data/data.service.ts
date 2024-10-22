import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  protected _url: string;
  private _http: HttpClient;

  get url() {
    return this._url;
  }

  constructor(http: HttpClient) {
    this._http = http;
  }

   /**
   * Funzione per recuperare una lista di elementi
   *
   * @param optionalHeaders header opzionali da aggiungere alla richiesta http
   * @param queryParams parametri di query opzionali da aggiungere alla richiesta http
   * @returns ritorna un observable della risposta http
   */
  protected get(optionalHeaders?: HttpHeaders, queryParams?: HttpParams): Observable<Object> {
    if (optionalHeaders) {
      return this._http.get( this.url, { headers: optionalHeaders, observe: 'body', params: queryParams })
        .pipe(
          retry(1),
          catchError(this.handleErrors)
        );
      }

    return this._http.get( this.url, { observe: 'body' })
      .pipe(
        retry(1),
        catchError(this.handleErrors)
      );
  }
  /**
   * Funzione per recuperare i dettagli di un elemento generico
   *
   * @param id id dell'elemento da recuperare
   * @param optionalHeaders header opzionali da aggiungere alla richiesta http
   * @param queryParams parametri di query opzionali da aggiungere alla richiesta http
   * @returns ritorna un observable della risposta http
   */
  protected getElement(id: any, optionalHeaders?: HttpHeaders, queryParams?: HttpParams) {
    if (optionalHeaders) {
      return this._http.get(this.url + '/' + id, { headers: optionalHeaders, observe: 'body', params: queryParams })
        .pipe(
          retry(1),
          catchError(this.handleErrors)
        );
      }

    return this._http.get(this.url + '/' + id, { observe: 'body' })
      .pipe(
        retry(1),
        catchError(this.handleErrors)
      );
  }

  protected createElement(model: any, optionalHeaders?: HttpHeaders): Observable<HttpResponse<any>> {
    return this._http.post(this._url + '/create', model, { headers: optionalHeaders, observe: 'response' })
      .pipe(
        retry(1),
        catchError(this.handleErrors)
      );
  }

  private handleErrors(error: HttpErrorResponse) {
    let httpError: HttpError;
    // console.log(error);
    if (error.error.status === 404) {
        httpError =  new NotFoundError(error);
      }

      httpError = new HttpError(error);
      return throwError(httpError);
    }
}

export class HttpError {
  private readonly _originalError: HttpErrorResponse;

  constructor(originalError?: HttpErrorResponse) {
      this._originalError = originalError;
  }

  get originalError() {
      return this._originalError;
  }
}

export class NotFoundError extends HttpError {

}
