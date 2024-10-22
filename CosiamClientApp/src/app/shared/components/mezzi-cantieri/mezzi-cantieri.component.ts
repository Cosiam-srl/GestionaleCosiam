import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ListaMezziDiCantiere } from 'app/models/listaMezziDiCantiere.model';
import { Mezzo } from 'app/models/mezzo.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { MezziService } from 'app/shared/services/data/mezzi.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
@Component({
  selector: 'app-mezzi-cantieri',
  templateUrl: './mezzi-cantieri.component.html',
  styleUrls: ['./mezzi-cantieri.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MezziCantieriComponent implements OnInit {


  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;


  // array che contiene tutti i mezzi esistenti(non solo quello relativo ad un cantiere ma proprio tutti)
  mezziget: Mezzo[] = []
  // array che contiene i mezzi relativi a questo cantiere
  mezziCantiere: ListaMezziDiCantiere[];
  // array che contiene gli id dei mezzi selezionati usando le checkbox
  checked: number[] = [];
  // array che contiene i mezzi selezionati da aggiungere al cantiere
  nuovimezzi: any = [];
  // data di inizio assegnamento nel cantiere aggiunta nell'aggiungi mezzo
  dataInizioAssegnamento = new Date();
  // data di fine assegnamento nel cantiere aggiunta nell'aggiungi mezzo
  dataFineAssegnamento = new Date();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];


  constructor(private service: CantieriService, private modalService: NgbModal, private mezziservice: MezziService) { }

  ngOnInit(): void {
    // acquisisco i mezzi relativi a questo cantiere
    this.service.getMezziCAntiere(this.targetCantiereId)
      .subscribe(
        (res) => {
          this.mezziCantiere = res, this.tempData = res;
          console.log('mezzi', this.mezziCantiere)
        },
        (err) => {
          LoggingService.log('errore nel get dei mezzi cantiere', LogLevel.warn, err)
        },
        () => { LoggingService.log('mezzi del cantiere ottenuti', LogLevel.debug, this.mezziCantiere) }
      )


    // acquisisco la lista di tutti i mezzi esistenti nel DB
    this.mezziservice.getAllMezzi()
      .subscribe(
        (res) => { this.mezziget = res },
        (err) => {
          LoggingService.log('errore nel get di tutti i mezzi', LogLevel.warn, err)
        },
        () => { LoggingService.log('mezzi ottenuti', LogLevel.debug, this.mezziget) }
      )

  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add mezzo', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.mezzo.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.mezziCantiere = temp;

  }

  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  // funzione utilizzata dai datepicker
  cambia(event: NgbDate, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    switch (binding) {
      case 'dataInizio': {
        this.dataInizioAssegnamento = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di inizio del nuovo mezzo è', LogLevel.debug, this.dataInizioAssegnamento);
        break;
      }
      case 'dataFine': {
        this.dataFineAssegnamento = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di fine del nuovo mezzo è', LogLevel.debug, this.dataFineAssegnamento);
        break;
      }
      default: {
        LoggingService.log('Problemino col datepicker', LogLevel.debug);
        break;
      }
    }

  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  aggiungiMezzi() {
    LoggingService.log('i mezzi da aggiungere sono', LogLevel.debug, this.nuovimezzi)
    LoggingService.log('la data inizio è', LogLevel.debug, this.dataInizioAssegnamento)
    LoggingService.log('la data di fine è', LogLevel.debug, this.dataFineAssegnamento)
    // chiamo la post personaleCantiere per aggiungere il personale
    this.service.postMezziCantiere(this.targetCantiereId, this.nuovimezzi, this.dataInizioAssegnamento.toDateString(), this.dataFineAssegnamento.toDateString())
      .subscribe(
        (res) => {
          // this.ritornoPostPersonale = res,
          this.aggiornatabella(res),
            this.mezziCantiere = [...this.mezziCantiere]
        },
        (err) => {
          LoggingService.log('errore nel post mezzi cantiere', LogLevel.warn, err)
        },
        () => { }
      )

    // ricarico la tabella personale

    // reinizializzo le due date
    this.dataInizioAssegnamento = null;
    this.dataFineAssegnamento = null;
  }

  private aggiornatabella(pers: ListaMezziDiCantiere[]) {

    this.mezziCantiere = this.mezziCantiere.concat(pers);
  }

  // metodo necessario per il tasto Conferma dentro l'aggiungi personale(vedi shared/animation/sweet-alerts)
  TypeSuccess() {
    swal.fire({
      title: 'Mezzi aggiunti al cantiere!',
      text: 'I mezzi sono stati aggiunti nella tabella',
      icon: 'success',
      customClass: {
        confirmButton: 'btn btn-primary'

      },
      buttonsStyling: false,
      confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
    });
  }
  ConfirmText() {

    let str: string;
    let str2 = 'Elimina i mezzi selezionati dal cantiere';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun mezzo selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare il mezzo selezionato dal cantiere?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' mezzi dal cantiere?';
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
        LoggingService.log('array di mezzi da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.service.deleteMezziCantiere(this.targetCantiereId, this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)
              for (const mezzo of this.checked) {
                this.mezziCantiere.splice(
                  this.mezziCantiere.indexOf(
                    this.mezziCantiere.find(x => x.id == mezzo)
                  ),
                  1
                )
              }
              this.mezziCantiere = [...this.mezziCantiere];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'I mezzi selezionati sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I mezzi selezionati NON sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-danger'
                }
              });
            },
            () => { }
          )
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }
}
