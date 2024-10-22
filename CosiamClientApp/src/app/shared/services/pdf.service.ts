import {inject, Injectable} from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AppConfigService} from './configs/app-config.service';
import {CantieriService} from './data/cantieri.service';
import {Cantiere} from '../../models/cantiere.model';
import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  spinner = inject(NgxSpinnerService)

  cantieriservice = inject(CantieriService)

  _http = inject(HttpClient)

  _auth = inject(AuthService)

  constructor() {
  }




  async downloadPDF(id: string, filename?: string, after?: Function, spinner?: NgxSpinnerService, orientation: 'portrait' | 'landscape' = 'portrait') {

    if (spinner) {
      spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
          color: '#1898d6', // colore icona che si muove
          fullScreen: true
        });
    }

    const data = document.getElementById(id);

    const d = new Date();
    if (data) {
      const canvas = await html2canvas(data);

      const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm', // usa 'mm' come unità di misura
        format: 'a4' // Usa A4 come formato di riferimento
      });

      const imgData = canvas.toDataURL('image/png');

      // Ottieni la larghezza e l'altezza della pagina
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Calcola la nuova altezza proporzionale all'immagine in base alla larghezza della pagina
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Aggiungi la prima immagine
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'MEDIUM');
      heightLeft -= pageHeight;

      // Se l'immagine è troppo grande, continua a inserire su nuove pagine
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'MEDIUM');
        heightLeft -= pageHeight;
      }

      doc.save(`${filename}-${d.toLocaleDateString()}-${d.toLocaleTimeString()}` ?? 'file');

      if (after) {
        after();
      }

    }
    if (spinner) {
      spinner.hide();
    }
  }

  reportSomma(idReport: number, startDateAggrega: string, endDateAggrega: string, exportType: 'pdf' | 'xlsx', cantiere: Cantiere, mostraCosti: boolean, mostraRicavi: boolean, mostraFoto: boolean, reportCompleto: boolean, reportSingolo: boolean) {

    if (!startDateAggrega) {
      alert('Manca data inizio, facciamo export iniziando con la data dell inizio del progetto!');
      // Mettiamo una data molto vecchia January 1, 1900
      const oldDate = new Date(1900, 0, 1); // Months are zero-indexed (0 = January)

      // Extract the year, month, and day
      const year = oldDate.getFullYear();
      const month = String(oldDate.getMonth() + 1).padStart(2, '0'); // Add 1 because months are zero-indexed
      const day = String(oldDate.getDate()).padStart(2, '0');

      startDateAggrega = `${year}-${month}-${day}`;

    }

    if (!endDateAggrega) {
      alert('Manca data fine report, facciamo export fino ad oggi!');

      // Facciamo la data di oggi
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const day = String(today.getDate()).padStart(2, '0');

      endDateAggrega = `${year}-${month}-${day}`;
      console.log(endDateAggrega);
    }

    // Avvia lo spinner immediatamente
    this.spinner.show('spinner3', {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
      color: '#fcfc03', // colore icona che si muove
      fullScreen: true
    });

    // Ottieni il modello del report
    this.cantieriservice.getReportSomma(idReport, cantiere.id, startDateAggrega, endDateAggrega, mostraCosti, mostraRicavi, mostraFoto, reportCompleto, reportSingolo).subscribe(reportModel => {
      let authHeaders = this._auth.retrieveHeaders();
      let param = new HttpParams()
        .set('exportType', exportType);
      this._http.post(AppConfigService.settings.apiServer.baseUrl + '/home/GenerateSommaReport', reportModel,
        {headers: authHeaders, observe: 'body', params: param, responseType: 'arraybuffer'})
        .subscribe((res: any) => {
            this.spinner.hide('spinner3');
            this.spinner.hide();

            const fileType = exportType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const fileExtension = exportType === 'pdf' ? 'pdf' : 'xlsx';

            let fileName = 'Consuntivo ' + cantiere.shortDescription + ' dal ' + startDateAggrega + ' al ' + endDateAggrega + '.' + fileExtension;

            if (idReport !== 0) {
              fileName = 'Report ' + cantiere.shortDescription + ' ' + startDateAggrega + '.' + fileExtension;
            }
            // Crea un link nascosto, imposta l'URL del Blob e inizia il download
            let downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob([res], {type: fileType}));
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Pulizia
            window.URL.revokeObjectURL(downloadLink.href);
            document.body.removeChild(downloadLink);
          },
          (err) => {
            console.error(err);
            this.spinner.hide();
            this.spinner.hide('spinner3');
          }
        );
    });
  }
}
