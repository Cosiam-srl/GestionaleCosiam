import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbDate, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {Dpi} from 'app/models/dpi.model';
import {DpiService} from 'app/shared/services/data/dpi.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import localeIt from '@angular/common/locales/it';
import {registerLocaleData} from '@angular/common';
import {NgxSpinnerService} from 'ngx-spinner';
import {PdfService} from '../../../../shared/services/pdf.service';

@Component({
  selector: 'app-dpi-table',
  templateUrl: './dpi-table.component.html',
  styleUrls: ['./dpi-table.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DpiTableComponent implements OnInit {

  // variabile che contiene il numero di cantiere
  // @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // array che contiene tutti i dpi
  dpi: Dpi[];
  // array che contiene gli id dei dpi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un'attrezzatura da aggiungere
  nuovoDpi = new Dpi();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile usata per la validazione del form
  fff = false;
  // variabile usata nel form di creazione
  usable = '';

  limit: number = 25;

  constructor(private cdRef: ChangeDetectorRef, private pdf: PdfService, private modalService: NgbModal, private router: Router, private dpiservice: DpiService, private _spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it');
    this.dpiservice.getAllDpi()
      .subscribe(
        (res) => {
          LoggingService.log('ottenuti tutti i dpi', LogLevel.debug, res);
          this.dpi = res;
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('Errore get all dpi', LogLevel.error, err);
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-DPI');
          tableRef.click();
        },
      )
  }

  // chiamata quando si clicca su una riga della tabella. Apre la visualizzazione dell'attrezzatura
  viewDPI(event, modale) {
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
      this.dpiservice.getDpi(event.row.id)
        .subscribe(
          (res) => {
            LoggingService.log('scaricato dpi', LogLevel.debug, res);
            this.nuovoDpi = res;
            if (this.nuovoDpi.usable) {
              this.usable = this.nuovoDpi.usable.toString();
            }
            this._spinner.hide();
          },
          (err) => {
            LoggingService.log('ERRORE scaricamento dpi', LogLevel.error, err);
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

  modifyDPI(row, modale) {
    LoggingService.log('modale', LogLevel.debug, event);
    this._spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.dpiservice.getDpi(row.id)
      .subscribe(
        (res) => {
          LoggingService.log('scaricato dpi', LogLevel.debug, res);
          this.nuovoDpi = res;
          if (this.nuovoDpi.usable) {
            this.usable = this.nuovoDpi.usable.toString();
          }
          this._spinner.hide();
        },
        (err) => {
          LoggingService.log('ERRORE scaricamento dpi', LogLevel.error, err);
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

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro dpi', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.description.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.dpi = temp;

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
  onEdit(target: Dpi) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/dpi/', target.id]);
  }

  updateDpi() {
    LoggingService.log('upload di questo nuovo dpi', LogLevel.debug, this.nuovoDpi);
    if (this.usable == 'true') {
      this.nuovoDpi.usable = true;
    } else if (this.usable == 'false') {
      this.nuovoDpi.usable = false;
    }
    this.dpiservice.updateDpi(this.nuovoDpi).subscribe(
      (res) => {
        console.log('UPDATE dpi ok', res);
        swal.fire({
          title: 'DPI Aggiornato!',
          text: 'Il DPI è stato aggiornato',
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'

          },
          buttonsStyling: false,
          confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
        });
        const index = this.dpi.findIndex(x => x.id == this.nuovoDpi.id);
        this.dpi[index].maintenanceExpiration = this.nuovoDpi.maintenanceExpiration;
        this.dpi = [...this.dpi];
      },
      (err) => {
        console.error('ERRORE UPDATE dpi', err);
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Il DPI NON è stato modificato.',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      },
    )
  }

  deleteDPI(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il DPI selezionato';
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
            this.dpiservice.deleteDpi(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('dpi eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il DPI selezionato è stato cancellato',
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
                    text: 'Il DPI selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.dpi.splice(
                    this.dpi.indexOf(
                      this.dpi.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.dpi = [...this.dpi];
                  this.tempData = this.dpi;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  clearData() {
    this.nuovoDpi = new Dpi();
    this.fff = false;
    this.usable = '';
  }

  creaDpi() {
    LoggingService.log('il nuovo dpi è', LogLevel.debug, this.nuovoDpi);
    if (this.usable == 'true') {
      this.nuovoDpi.usable = true;
    } else if (this.usable == 'false') {
      this.nuovoDpi.usable = false;
    }
    this.dpiservice.postDpi(this.nuovoDpi)
      .subscribe(
        (res) => {
          LoggingService.log('nuovoDPI postato con successo', LogLevel.debug, res);
          this.nuovoDpi.id = res.id;

          swal.fire({
            title: 'DPI Creato!',
            text: 'Il DPI è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });

        },
        (err) => {
          LoggingService.log('ERRORE post nuovo DPI', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il DPI NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.dpi.unshift(this.nuovoDpi);
          this.dpi = [...this.dpi];
          this.clearData();
          this.tempData = this.dpi;
        }
      )

  }

  // metodo chiamato quando si seleziona una data nel form
  cambia(event: NgbDate, binding: string) {

    LoggingService.log('cambia è', LogLevel.debug, event);
    LoggingService.log('binding è', LogLevel.debug, binding);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    if (event.year == null && event.month == null && event.day == null) {
      this.nuovoDpi.maintenanceExpiration = null;
      console.log('cancella data', event);
    } else {
      switch (binding) {
        case 'scadenzaManutenzione': {
          this.nuovoDpi.maintenanceExpiration = new Date(event.year, event.month, event.day, ore, minuti, secondi);
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
    if (this.usable == 'true') {
      this.nuovoDpi.usable = true;
    } else if (this.usable == 'false') {
      this.nuovoDpi.usable = false;
    }
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
    if (this.dpi.length > this.limit) {

      let l = this.limit
      this.limit = this.dpi.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-DPI', `DPI`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-DPI', `DPI`, null, this._spinner)
    }

  }
}
