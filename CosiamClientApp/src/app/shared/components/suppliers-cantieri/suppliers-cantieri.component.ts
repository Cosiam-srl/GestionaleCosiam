import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Supplier } from 'app/models/supplier.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import { SupplierService } from '../../services/data/supplier.service';

@Component({
  selector: 'app-suppliers-cantieri',
  templateUrl: './suppliers-cantieri.component.html',
  styleUrls: ['./suppliers-cantieri.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SuppliersCantieriComponent implements OnInit {

  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;


  // array che contiene tutti i fornitori esistenti(non solo quello relativo ad un cantiere ma proprio tutti)
  fornitoriget: Supplier[] = []
  // array che contiene i fornitori relativi a questo cantiere
  fornitoriCantiere: Supplier[];
  // array che contiene gli id dei fornitori selezionati usando le checkbox
  checked: number[] = [];
  // array che contiene i fornitori selezionati da aggiungere al cantiere
  nuovifornitori: any = [];
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];


  constructor(private service: CantieriService, private modalService: NgbModal, private fornitoriservice: SupplierService) { }

  ngOnInit(): void {
    // acquisisco i mezzi relativi a questo cantiere
    this.service.getFornitoriCantiere(this.targetCantiereId)
      .subscribe(
        (res) => { this.fornitoriCantiere = res, this.tempData = res },
        (err) => {
          LoggingService.log('errore nel get dei fornitori cantiere', LogLevel.warn, err)
        },
        () => { LoggingService.log('fonritori del cantiere ottenuti', LogLevel.debug, this.fornitoriCantiere) }
      )


    // acquisisco la lista di tutti i mezzi esistenti nel DB
    this.fornitoriservice.getAllFornitori()
      .subscribe(
        (res) => { this.fornitoriget = res },
        (err) => {
          LoggingService.log('errore nel get di tutti i fornitori', LogLevel.warn, err)
        },
        () => { LoggingService.log('fornitori ottenuti', LogLevel.debug, this.fornitoriget) }
      )

  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add mezzo', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.name.toLowerCase().indexOf(val) !== -1 || d.type.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.fornitoriCantiere = temp;

  }

  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  aggiungiFornitori() {
    LoggingService.log('i fornitori da aggiungere sono', LogLevel.debug, this.nuovifornitori)
    // chiamo la post personaleCantiere per aggiungere il personale
    this.service.postFornitoriCantiere(this.targetCantiereId, this.nuovifornitori)
      .subscribe(
        (res) => {
          // this.ritornoPostPersonale = res,
          this.aggiornatabella(res),
            this.fornitoriCantiere = [...this.fornitoriCantiere]
        },
        (err) => {
          LoggingService.log('errore nel post mezzi cantiere', LogLevel.warn, err)
        },
        () => { }
      )

  }

  private aggiornatabella(forn: Supplier[]) {

    this.fornitoriCantiere = this.fornitoriCantiere.concat(forn);
  }

  // metodo necessario per il tasto Conferma dentro l'aggiungi personale(vedi shared/animation/sweet-alerts)
  TypeSuccess() {
    swal.fire({
      title: 'Fornitori aggiunti al cantiere!',
      text: 'I fornitori sono stati aggiunti nella tabella',
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
    let str2 = 'Elimina i fornitori selezionati dal cantiere';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun fornitore selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare il fornitore selezionato dal cantiere?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' fornitori dal cantiere?';
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
        LoggingService.log('array di fornitori da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.service.deleteFornitoriCantiere(this.targetCantiereId, this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)
              for (const mezzo of this.checked) {
                this.fornitoriCantiere.splice(
                  this.fornitoriCantiere.indexOf(
                    this.fornitoriCantiere.find(x => x.id == mezzo)
                  ),
                  1
                )
              }
              this.fornitoriCantiere = [...this.fornitoriCantiere];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'I fornitori selezionati sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I fornitori selezionati NON sono stati cancellati',
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
