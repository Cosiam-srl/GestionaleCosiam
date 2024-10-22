import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {InventarioGenerale} from 'app/models/inventariogenerale.model';
import {InventarioGeneraleService} from 'app/shared/services/data/inventariogenerale.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {PdfService} from '../../../../shared/services/pdf.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-inventario-generale-table',
  templateUrl: './inventario-generale-table.component.html',
  styleUrls: ['./inventario-generale-table.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})

export class InventarioGeneraleTableComponent implements OnInit {
;

  // variabile che contiene il numero di cantiere
  // @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // array che contiene tutta l'attrezzatura
  inventario: InventarioGenerale[];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un'attrezzatura da aggiungere
  nuovoInventarioGenerale = new InventarioGenerale();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile utilizzata per la validazione del form
  fff = false;

  limit: number = 25;

  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private modalService: NgbModal, private router: Router, private inventarioservice: InventarioGeneraleService) {

  }

  ngOnInit(): void {
    this.inventarioservice.getAllInventarioGenerale()
      .subscribe(
        (res) => {
          LoggingService.log('ottenuti tutti gli oggetti dell\'inventario', LogLevel.debug, res);
          this.inventario = res;
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('Errore get oggetti inventario', LogLevel.error, err);
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-inventariogenerale');
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
      return d.category.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.inventario = temp;

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

  // chiamata quando si clicca su una riga della tabella. Apre la visualizzazione di quell'elemento
  viewInventario(event, modale) {
    if (event.type == 'click' && event.column.name != 'Azioni') {
      LoggingService.log('modale', LogLevel.debug, event);
      this.modalService.open(modale, {
        size: 'xl', backdrop: 'static',
        scrollable: true,
        keyboard: false
      });

      this.nuovoInventarioGenerale = event.row
    }
  }

  updateInventario() {
    LoggingService.log('Update elemento dell\'inventario', LogLevel.debug, this.nuovoInventarioGenerale);

    this.inventarioservice.updateInventarioGenerale(this.nuovoInventarioGenerale)
      .subscribe(
        (res) => {
          // res è solo uno status code
          LoggingService.log('ok update andato', LogLevel.debug, res);
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'L\'elemento dell\'inventario è stata modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          LoggingService.log('prima dello splice', LogLevel.debug, {...this.inventario});
          LoggingService.log('index of prima', LogLevel.debug, this.inventario.indexOf(
            this.inventario.find(x => x.id === this.nuovoInventarioGenerale.id)
          ));

          // pos contiene la posizione della nota da modificare
          const pos = this.inventario.indexOf(this.inventario.find(x => x.id == this.nuovoInventarioGenerale.id));
          // sovrascrivo l'oggetto in posizione pos con la nuovaTsggedNota
          this.inventario[pos] = this.nuovoInventarioGenerale;
          LoggingService.log('inventario dopo l\'update è diventato', LogLevel.debug, this.inventario);
          // aggiorno tempdata per il filtro di ricerca
          this.tempData = this.inventario;
          // ricarico la tabella
          this.inventario = [...this.inventario];
        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\elemento dell\'inventario NON è stata modificata',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          // this.clearData();
        }
      );
  }  // funzione chiamata alla pressione del bottone posto su ogni riga della tabella
  goToDashboard(target: InventarioGenerale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quell'oggetto
    this.router.navigate(['/page/dashboards/ig/', target.id]);
  }

  // funzione chiamata per modificare un elemento della tabella
  onEdit(target: InventarioGenerale, modale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    this.inventarioservice.getAttrezzo(target.id)
      .subscribe(
        (res) => {
          LoggingService.log('scaricato elemento inventario', LogLevel.debug, res);
          this.nuovoInventarioGenerale = res;
        },
        (err) => {
          LoggingService.log('ERRORE scaricamento elemento inventario', LogLevel.error, err);
        },
        () => {
          // apro il popup
          this.openLg(modale);
        },
      )
  }

  deleteInventarioGenerale(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina l\'oggetto dell\'inventario selezionato';
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
            this.inventarioservice.deleteInventarioGenerale(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('oggetto inventario eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'L\'oggetto selezionato è stato cancellato',
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
                    text: 'L\'oggetto selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.inventario.splice(
                    this.inventario.indexOf(
                      this.inventario.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.inventario = [...this.inventario];
                  this.tempData = this.inventario;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  clearData() {
    this.nuovoInventarioGenerale = new InventarioGenerale();
    this.fff = false;
  }

  creaInventarioGenerale() {
    LoggingService.log('il nuovo inventariogenerale è', LogLevel.debug, this.nuovoInventarioGenerale);
    this.inventarioservice.postInventarioGenerale(this.nuovoInventarioGenerale)
      .subscribe(
        (res) => {
          LoggingService.log('nuovo oggeto inventario postato con successo', LogLevel.debug, res);
          this.nuovoInventarioGenerale.id = res.id;

          swal.fire({
            title: 'Oggetto Creato!',
            text: 'L\'oggetto dell\'inventario è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovo oggetto inventario', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\'oggetto NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.inventario.unshift(this.nuovoInventarioGenerale);
          this.inventario = [...this.inventario];
          this.clearData();
          this.tempData = this.inventario;
        }
      )

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
    if (this.inventario.length > this.limit) {

      let l = this.limit
      this.limit = this.inventario.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-inventariogenerale', `inventariogenerale`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-inventariogenerale', `inventariogenerale`, null, this._spinner)
    }

  }

}


