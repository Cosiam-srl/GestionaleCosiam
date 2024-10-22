import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {ServizioFornitore} from 'app/models/benieservizi.model';
import {SupplierService} from 'app/shared/services/data/supplier.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-beni-e-servizi',
  templateUrl: './beni-e-servizi.component.html',
  styleUrls: ['./beni-e-servizi.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BeniEServiziComponent implements OnInit {
  // unità di misura prestabilite
  static ums = ['a corpo', 'cad', 'cadauno x giorno', 'cadauno x mese', 'cadauno x trefolo', 'cm', 'dm cubi', 'giorni', 'giorni x ml', 'h', 'ha', 'hm', 'kg', 'Km', 'kN', 'kN x cm', 'L', 'm', 'm²', 'm quadri / sett.', 'm³', 'm cubi x km', 'mese', 'mese x m lineari', 'ml', 'mq x 4 cm', 'mq x 5 cm', 'mq x cm', 'quintale', 'quintale x km', 'settimana', 't', 'watt picco']

  // variabile che contiene il numero di cantiere
  @Input() targetFornitoreId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;
  // array che contiene tutti i beni e servizi di un fornitore
  servizi: ServizioFornitore[];
  // oggetto che contiene i dati del nuovo servizio che si sta creando nel form
  nuovoservizio = new ServizioFornitore();
  // array che contiene gli id delle note selezionate usando le checkbox
  checked: number[] = [];
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];

  ums = BeniEServiziComponent.ums

  // filtro
  filter = ''

  constructor(private modalService: NgbModal, private servizifornitore: SupplierService) {
  }

  ngOnInit(): void {

    this.servizifornitore.getServiziFornitore(this.targetFornitoreId)
      .subscribe(
        (res) => {
          LoggingService.log('servizi fornitore scaricati', LogLevel.debug, res);
          this.servizi = res;
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('ERRORE get servizi fornitore ', LogLevel.debug, err);

        },
        () => {
        },
      )
  }

  filterUpdate(val) {

    LoggingService.log('filtro add mezzo', LogLevel.debug, this.tempData)

    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.description.toLowerCase().indexOf(val) !== -1 || d.category.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.servizi = temp;

  }

  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {size: 'lg'});
  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  clearData() {
    this.nuovoservizio = new ServizioFornitore();
  }

  aggiungiServizioFornitore() {
    LoggingService.log('nuovoservizio:', LogLevel.debug, this.nuovoservizio);
    this.nuovoservizio.idFornitore = this.targetFornitoreId.toString();
    this.servizifornitore.postServizioFornitore(this.nuovoservizio)
      .subscribe(
        (res) => {
          this.nuovoservizio.id = res.id;
          LoggingService.log('nuovo prezziario postato con successo', LogLevel.debug, res);
          swal.fire({
            title: 'Elemento Aggiunto!',
            text: 'L\'elemento è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('errore post nuovo prezziario ', LogLevel.warn, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\'elemento NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });

        },
        () => {
          LoggingService.log('nuovo servizio id: ', LogLevel.warn, this.nuovoservizio.id);
          this.servizi.unshift(this.nuovoservizio);
          this.servizi = [...this.servizi];
          this.clearData();
          this.tempData = this.servizi;
        },
      )
  }

  // metodo chiamato quando si intende modificare un servizio
  onEdit(target: ServizioFornitore, modale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);

    // apro il popup
    this.nuovoservizio = {...target};
    this.openLg(modale);

  }

  // metodo per l'update di un servizio
  updateServizioFornitore() {
    LoggingService.log('sto per fare l\'upload di questo servizio', LogLevel.debug, this.nuovoservizio);
    this.servizifornitore.updateServizioFornitore(this.nuovoservizio, this.nuovoservizio.id)
      .subscribe(
        (res) => {
          LoggingService.log('ok update andato', LogLevel.debug, res);
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il servizio è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          // pos contiene la posizione del servizio da modificare
          const pos = this.servizi.indexOf(this.servizi.find(x => x.id === this.nuovoservizio.id));
          // sovrascrivo l'oggetto in posizione pos con il nuovoservizio
          this.servizi[pos] = this.nuovoservizio;
          this.tempData = this.servizi;
          // ricarico la tabella
          this.servizi = [...this.servizi];
        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il servizio NON è stato modificato',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.clearData();
        },
      )
  }

  // metodo usato per l'eliminazione di una o piu righe della tabella
  ConfirmText() {

    let str: string;
    let str2 = 'Elimina i servizi selezionati';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length === 0) {
      str = 'Nessun servizio selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length === 1) {
      str = 'Vuoi eliminare il servizio selezionato?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' servizi?';
    }

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
      confirmButtonText: str2,
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info ml-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        // dall'array selected che contiene gli elementi selezionati estraggo solo gli id e li muovo nell'array checked
        for (let i = 0; i < this.selected.length; i++) {
          this.checked[i] = this.selected[i].id
        }
        LoggingService.log('array di servizi da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.servizifornitore.deleteServiziFornitore(this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)
              // rimuovo dall'array i servizi che ho eliminato e aggiorno la tabella
              for (let i = 0; i < this.checked.length; i++) {
                this.servizi.forEach(element => {
                  if (element.id === this.checked[i]) {
                    this.servizi.splice(this.servizi.indexOf(element), 1);
                  }
                });
              }
              this.servizi = [...this.servizi];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              this.tempData = this.servizi;
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'I servizi selezionati sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I servizi selezionati NON sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-danger'
                }
              });
            },
            () => {
            }
          )
      }
    })

  }

}
