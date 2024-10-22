import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { _File } from 'app/models/file.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { Observable } from 'rxjs';
import { AuthService } from 'app/shared/auth/auth.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  providers: [NgbProgressbarConfig]
})
export class UploaderComponent implements OnInit {

  // variabile utile per il caricamento dei file
  fileName = '';
  nuovofile: any;
  caricamento = 0;
  @Output() fileUpload = new EventEmitter<_File>();
  @Input() url = '';

  constructor(private service: CantieriService, private http: HttpClient, config: NgbProgressbarConfig, private _authService: AuthService) {
    config.max = 100;
    config.striped = true;
    config.animated = true;
    config.type = 'success';
    config.height = '20px';
  }

  ngOnInit(): void {

  }

  // metodo per il caricamento(upload) dei file
  onFileSelected(event) {

    const file: File = event.target.files[0];
    LoggingService.log('file caricato', LogLevel.debug, file);

    if (file) {
      this.fileName = file.name;
      LoggingService.log('file name è', LogLevel.debug, this.fileName);
      const formData = new FormData();
      formData.append('formFile', file);

      this.postFile(formData)
        .subscribe(
          (event: HttpProgressEvent) => {
            this.nuovofile = event;
            LoggingService.log('andata! post dei file del cantierexxxx', LogLevel.warn, event);
            this.caricamento = Math.round((event.loaded / event.total) * 100);
            LoggingService.log('caricamento', LogLevel.warn, this.caricamento);

            // TODO: Da pulire potare eliminare
            const prg = document.getElementById('uploadProgress') as HTMLElement
            if (prg) { prg.click(); }
          },
          (err) => {
            LoggingService.log('errore nel post dei file del cantierexxxx', LogLevel.warn, err);
            this.caricamento = 0; // scompare la barra di caricamento
          },
          () => {
            LoggingService.log('file del cantiere postato', LogLevel.debug, this.nuovofile.body);
            this.fileUpload.emit(this.nuovofile.body as _File);
            this.caricamento = 0;
            // svuoto il testo di fianco al tasto "carica"
            setTimeout(() => {
              this.fileName = ''
            }, 5000);
          }
        )
    }
  }

  postFile(file: FormData): Observable<any> {
    const authHeader = this._authService.retrieveHeaders();
    return this.http.post(this.url, file, {
      reportProgress: true,
      observe: 'events',
      headers: authHeader
    }
    )
  }

}
