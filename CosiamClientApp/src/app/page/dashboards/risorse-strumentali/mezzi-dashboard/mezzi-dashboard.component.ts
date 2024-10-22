import { registerLocaleData } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Mezzo, ScadenzeMezzo } from 'app/models/mezzo.model';
import { MezziService } from 'app/shared/services/data/mezzi.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import localeIt from '@angular/common/locales/it';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { Cantiere } from 'app/models/cantiere.model';
import { EstrazioneDatiPersonaleMezziModel } from 'app/models/personale.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-mezzi-dashboard',
  templateUrl: './mezzi-dashboard.component.html',
  styleUrls: ['./mezzi-dashboard.component.scss']
})
export class MezziDashboardComponent implements OnInit {
  // attributo per le tabs
  active = 1;
  idMezzo: number;
  mezzo: Mezzo = new Mezzo();
  nuovomezzo: Mezzo = new Mezzo();
  // variabile che contiene tutte le scadenze insieme
  scadenzeMezzi: ScadenzeMezzo[] = [];
  // variabile che contiene la lista dei cantieri in cui questo mezzo è attualmente occupato(NON CONTIENE I CANTIERI TERMINATI)
  cantieriMezzo: Cantiere[] = [];
  // variabile che fa binding col campo contoProprio/contoTerzi nel form di creazione del mezzo
  contoproprioterzi: string;
  // roba per il form
  fff = false;

  estraiDatiModel = new EstrazioneDatiPersonaleMezziModel()

  constructor(private _modalService: NgbModal,
    private _mezziservice: MezziService,
    private router: Router,
    private activatedroutere: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _spinner: NgxSpinnerService) {
    // Estrai l'ID del mezzo dall'URL e convertilo in un numero
    const idMezzoString = this.activatedroutere.snapshot.paramMap.get('id');
    this.idMezzo = idMezzoString ? Number.parseInt(idMezzoString) : 0; // Usa 0 o un altro valore predefinito se l'ID è null
  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it-IT');
    // escludo dalle scadenze imminenti quelle con stato Chiuso(mettendo a false il secondo parametro)
    this._mezziservice.getMezzo(this.idMezzo)
      .subscribe(
        (res) => {
          this.nuovomezzo = res;
          this.mezzo = res;
          // setto correttamente la variabile contoproprioterzi in modo da avere il binding quando apro il popup di modifica
          if (this.mezzo.contoProprioContoTerzi == true) {
            this.contoproprioterzi = 'true'
          } else {
            this.contoproprioterzi = 'false'
          }

          LoggingService.log('mezzo scaricato', LogLevel.debug, this.nuovomezzo)
        },
        (err) => {
          LoggingService.log('ERRORE get mezzo', LogLevel.error, err);
        },
        () => {
          document.getElementById('cards').click();
        },
      )
    this._mezziservice.getScadenzeMezzoFiltered(this.idMezzo, false, null, 30)
      .subscribe(
        (res: ScadenzeMezzo[]) => {
          LoggingService.log('Scadenze filtrate 30 giorni ottenute', LogLevel.debug, res);
          this.scadenzeMezzi = res;
        },
        (err) => {
          LoggingService.log('ERRORE get scadenze filtrate 30 giorni', LogLevel.error, err);
        },
        () => {
          document.getElementById('cards').click();
        }
      )
    this._mezziservice.getCantieriMezzo(this.idMezzo)
      .subscribe(
        (res) => {
          LoggingService.log('get cantieri in cui il mezzo è impiegato', LogLevel.debug, res);
          this.cantieriMezzo = res;
        },
        (err) => {
          LoggingService.log('ERRORE get cantieri in cui il mezzo è impiegato ', LogLevel.error, err);
        },
        () => {
          // elimino dalla lista i cantieri che sono terminati
          const cantieriCorretti = [];
          this.cantieriMezzo.forEach(cantiere => {
            if (cantiere.state != 'Terminato') {
              // non inserisco dei duplicati nel caso la persona fosse stata inserita più volte in un cantiere magari con date di assegnamento diverse
              const index = cantieriCorretti.findIndex(e => e.id == cantiere.id);
              if (index == -1) {
                cantieriCorretti.push(cantiere);
              }
            }
          });
          this.cantieriMezzo = cantieriCorretti;
          this.cantieriMezzo = [...this.cantieriMezzo];
          this._cdr.detectChanges();
          LoggingService.log('cantieri in cui il mezzo lavora', LogLevel.debug, this.cantieriMezzo);
        },
      )
  }

  // metodo utilizzato per aprire un popup di modifica
  openLg(content) {
    this._modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });

  }
  updateMezzo() {
    if (this.contoproprioterzi == 'true') {
      this.nuovomezzo.contoProprioContoTerzi = true;
    } else {
      this.nuovomezzo.contoProprioContoTerzi = false;
    }
    this._mezziservice.updateMezzo(this.nuovomezzo)
      .subscribe(
        (res) => {
          LoggingService.log('mezzo aggiornato', LogLevel.debug, res);
          this.mezzo = res;
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il mezzo è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
        },
        (err) => {
          LoggingService.log('mezzo NON aggiornato', LogLevel.error, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il mezzo non è stato modificato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {

        },
      )
  }
  // funzione chiamata dai datepicker
  cambia(event, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    LoggingService.log('binding è', LogLevel.debug, binding);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    switch (binding) {
      case 'scadenzaAssicurazione': {
        this.nuovomezzo.insuranceExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'scadenzaRevisione': {
        this.nuovomezzo.revisionExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'scadenzaBollo': {
        this.nuovomezzo.stampDutyExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'tachigrafo': {
        this.nuovomezzo.tachograph = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'dataImmatricolazione': {
        this.nuovomezzo.matriculationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'licenzaCProprio': {
        this.nuovomezzo.licenseCProprio = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'libretto usura': {
        this.nuovomezzo.wearBook = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'furto/incendio': {
        this.nuovomezzo.furtoIncendio = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'ispsel': {
        this.nuovomezzo.ispsel = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'verifica ventennale': {
        this.nuovomezzo.TwentyYearVerificationOfLiftingOrgans = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }
  validationForm(form) {
    LoggingService.log('form', LogLevel.debug, form)
    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }
  // funzione chiamata quando si chiude il popup di modifica del mezzo
  cleanNuovoMezzo() {
    this.nuovomezzo = new Mezzo();
  }
  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }
  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
  };

  estraiDettagli(type: 'xlsx' | 'pdf') {
    this._spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this._mezziservice.estraiDatiMezzi([this.idMezzo], type, this.estraiDatiModel.dateFrom, this.estraiDatiModel.dateTo)
      .subscribe(
        (res: any) => {
          let fileType = type == 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
          let fileName = `Estrazione Mezzi.${type}`;

          // Crea un link nascosto, imposta l'URL del Blob e inizia il download
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob([res], { type: fileType }));
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();

          // Pulizia
          window.URL.revokeObjectURL(downloadLink.href);
          document.body.removeChild(downloadLink);
          this._spinner.hide()
        },
        (err) => {
          this._spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: "",
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        })
  }


}
