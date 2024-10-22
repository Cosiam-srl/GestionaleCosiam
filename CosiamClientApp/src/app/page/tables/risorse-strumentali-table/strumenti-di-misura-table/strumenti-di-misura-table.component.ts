import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {StrumentiDiMisura} from 'app/models/strumentidimisura.model';
import {StrumentiDiMisuraService} from 'app/shared/services/data/strumentidimisura.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import localeIt from '@angular/common/locales/it';
import {registerLocaleData} from '@angular/common';
import {NgxSpinnerService} from 'ngx-spinner';
import {PdfService} from '../../../../shared/services/pdf.service';

@Component({
  selector: 'app-strumenti-di-misura-table',
  templateUrl: './strumenti-di-misura-table.component.html',
  styleUrls: ['./strumenti-di-misura-table.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StrumentiDiMisuraTableComponent implements OnInit {

  // variabile che contiene il numero di cantiere
  // @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // array che contiene tutta l'attrezzatura
  strumenti: StrumentiDiMisura[];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un'attrezzatura da aggiungere
  nuovoStrumentoDiMisura = new StrumentiDiMisura();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile utilizzata per la validazione del form
  fff = false;

  limit: number = 25;

  constructor(private cdRef: ChangeDetectorRef, private pdf: PdfService, private modalService: NgbModal, private router: Router, private strumentiservice: StrumentiDiMisuraService, private _spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it');
    this.strumentiservice.getAllStrumentiDiMisura()
      .subscribe(
        (res) => {
          LoggingService.log('ottenuti tutti gli strumenti', LogLevel.debug, res);
          this.strumenti = res;
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('Errore get all strumenti', LogLevel.error, err);
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-sdm');
          tableRef.click();
        },
      )
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro attrezzatura', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.type.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.strumenti = temp;

  }

  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {size: 'xl'});
  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  // funzione chiamata alla pressione del bottone posto su ogni riga della tabella
  onEdit(target: StrumentiDiMisura) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/sdm/', target.id]);
  }

  viewStrumento(event, modale) {
    if (event.type == 'click' && event.column.name != 'Azioni') {
      LoggingService.log('modale', LogLevel.debug, event);
      this._spinner.show(undefined,
        {
          type: 'ball-fall',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
          color: '#1898d6', // colore icona che si muove
          fullScreen: true
        });
      this.strumentiservice.getStrumentoDiMisura(event.row.id)
        .subscribe(
          (res) => {
            LoggingService.log('scaricato strumento', LogLevel.debug, res);
            this.nuovoStrumentoDiMisura = res;

            this._spinner.hide();
          },
          (err) => {
            LoggingService.log('ERRORE scaricamento strumento', LogLevel.error, err);
            this._spinner.hide();
          },
          () => {

            this.modalService.open(modale, {
              size: 'xl', backdrop: 'static',
              scrollable: true,
              keyboard: false
            });
          },
        )

    }
  }

  modifyStrumento(row, modale) {

    LoggingService.log('modale', LogLevel.debug, event);
    this._spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.strumentiservice.getStrumentoDiMisura(row.id)
      .subscribe(
        (res) => {
          LoggingService.log('scaricato strumento di misura', LogLevel.debug, res);
          this.nuovoStrumentoDiMisura = res;

          this._spinner.hide();
        },
        (err) => {
          LoggingService.log('ERRORE scaricamento strumento di misura', LogLevel.error, err);
          this._spinner.hide();
        },
        () => {

          this.modalService.open(modale, {
            size: 'xl', backdrop: 'static',
            scrollable: true,
            keyboard: false
          });
        },
      )

  }

  updateStrumento() {
    LoggingService.log('upload di questo nuovo strumento', LogLevel.debug, this.nuovoStrumentoDiMisura);

    this.strumentiservice.updateStrumento(this.nuovoStrumentoDiMisura).subscribe(
      (res) => {
        console.log('UPDATE strumento ok', res);
        swal.fire({
          title: 'DPI Aggiornato!',
          text: 'Lo strumento è stato aggiornato',
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'

          },
          buttonsStyling: false,
          confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
        });
        const index = this.strumenti.findIndex(x => x.id == this.nuovoStrumentoDiMisura.id);
        this.strumenti[index].calibrationExpiration = this.nuovoStrumentoDiMisura.calibrationExpiration;
        this.strumenti = [...this.strumenti];
      },
      (err) => {
        console.error('ERRORE UPDATE strumento', err);
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Lo strumento NON è stato modificato.',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      },
    )
  }

  deleteStrumentoDiMisura(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina lo strumento selezionato';
    const check = true;
    const text = 'L\'azione è irreversibile';

    let ret;

    ret = swal.fire({
      title: str,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: check,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      cancelButtonText: 'Annulla',
      confirmButtonText: str,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info ml-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        swal.fire({
          title: 'Sei sicuro?',
          text: '',
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: check,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          cancelButtonText: 'No',
          confirmButtonText: 'Si sono sicuro',
          customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-info ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            LoggingService.log('event è', LogLevel.debug, event.id)
            this.strumentiservice.deleteStrumentoDiMisura(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('strumento eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Lo strumento selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione dpi', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Lo strumento selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.strumenti.splice(
                    this.strumenti.indexOf(
                      this.strumenti.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.strumenti = [...this.strumenti];
                  this.tempData = this.strumenti;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  clearData() {
    this.nuovoStrumentoDiMisura = new StrumentiDiMisura();
    this.fff = false;
  }

  creaStrumentoDiMisura() {
    LoggingService.log('il nuovo strumento di misura è', LogLevel.debug, this.nuovoStrumentoDiMisura);
    this.strumentiservice.postStrumentoDiMisura(this.nuovoStrumentoDiMisura)
      .subscribe(
        (res) => {
          LoggingService.log('nuovoDPI postato con successo', LogLevel.debug, res);
          this.nuovoStrumentoDiMisura.id = res.id;

          swal.fire({
            title: 'Strumento Creato!',
            text: 'Lo strumento è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovo strumento', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Lo strumento NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.strumenti.unshift(this.nuovoStrumentoDiMisura);
          this.strumenti = [...this.strumenti];
          this.clearData();
          this.tempData = this.strumenti;
        }
      )

  }

  cambia(event: NgbDate, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    LoggingService.log('binding è', LogLevel.debug, binding);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8))
    if (event.year == null && event.month == null && event.day == null) {
      this.nuovoStrumentoDiMisura.calibrationExpiration = null;
      console.log('cancella data', event);
    } else {
      switch (binding) {
        case 'scadenzaTaratura': {
          this.nuovoStrumentoDiMisura.calibrationExpiration = new Date(event.year, event.month, event.day, ore, minuti, secondi);
          break;
        }
        default: {
          // statements;
          break;
        }
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

  downloadPdf() {
    if (this.strumenti.length > this.limit) {

      let l = this.limit
      this.limit = this.strumenti.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-sdm', `strumenti`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-sdm', `strumenti`, null, this._spinner)
    }

  }

}


