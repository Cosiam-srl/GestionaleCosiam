import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { Router } from '@angular/router';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Personale } from 'app/models/personale.model';
import { Cantiere } from 'app/models/cantiere.model';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { ColumnMode, DatatableRowDetailDirective, SelectionType } from '@swimlane/ngx-datatable';
import { ListaPersonaleAssegnatoDiCantiere } from 'app/models/assegnamentoPersonale.model';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
@Component({
  selector: 'app-employees-cantieri',
  templateUrl: './employees-cantieri.component.html',
  styleUrls: ['./employees-cantieri.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeesCantieriComponent implements OnInit {

  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;
  // variabile utilizzata per l'apertura del popup aggiungi personale
  size: number;




  // array che contiene tutto il personale esistente(non solo quello relativo ad un cantiere ma proprio tutti)
  personaleget: Personale[] = []

  // array che contiene gli id delle note selezionate usando le checkbox
  checked: number[] = [];

  // array che contiene il personale relativo a questo cantiere
  personaleCantiere: ListaPersonaleAssegnatoDiCantiere[];
  // array che contiene il personale selezionato da aggiungere al cantiere
  nuovopersonale: any[] = [];
  // data di inizio assegnamento nel cantiere aggiunta nell'aggiungi personale
  dataInizioAssegnamento: Date = null;
  // data di fine assegnamento nel cantiere aggiunta nell'aggiungi personale
  dataFineAssegnamento: Date = null;
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile che serve per il controllo della disponibilita di una persona quando viene aggiunta al cantiere
  available = -1;
  // personale non disponibile
  notAvailable = '';
  /**
   *
   * @param service
   * @param router servizio di routing iniettato da Angular
   */
  constructor(private service: CantieriService, private router: Router, private modalService: NgbModal, private servicepersonale: PersonaleService) {

  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it-IT');
    // acquisisco il personale relativo a questo cantiere
    this.service.getListaPersonaleCantiere(this.targetCantiereId)
      .subscribe(
        (res) => { this.personaleCantiere = res, this.tempData = res },
        (err) => {
          LoggingService.log('errore nel get del personale cantiere', LogLevel.warn, err)
        },
        () => { LoggingService.log('personale del cantiere ottenuto', LogLevel.debug, this.personaleCantiere) }
      )


    // acquisisco la lista di tutto il personale esistente nel DB
    this.servicepersonale.getAllPersonale()
      .subscribe(
        (res) => { this.personaleget = res },
        (err) => {
          LoggingService.log('errore nel get del personale', LogLevel.warn, err)
        },
        () => {
          this.personaleget.forEach((i) => {
            i.fullName = i.name + ' ' + i.surname;
          })
        }
      )

  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add personale', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.personale.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.personaleCantiere = temp;

  }
  // funzione chiamata al click dell'azione di una riga della tabella
  onEdit(target: Cantiere) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/cantieri/', target.id]);
  }


  // metodo utilizzato dal tasto "aggiungi personale" per aprire un popup
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
        if (event.year == null || event.month == null || event.day == null) {
          this.dataInizioAssegnamento = null;
          this.checkAvailabilityPersonale()
          return
        }
        this.dataInizioAssegnamento = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di inizio del nuovo personale è', LogLevel.debug, this.dataInizioAssegnamento);
        break;
      }
      case 'dataFine': {
        if (event.year == null || event.month == null || event.day == null) {
          this.dataFineAssegnamento = null;
          this.checkAvailabilityPersonale()
          return
        }
        this.dataFineAssegnamento = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di fine del nuovo personale è', LogLevel.debug, this.dataFineAssegnamento);
        break;
      }
      default: {
        LoggingService.log('Problemino col datepicker', LogLevel.debug);
        break;
      }
    }
    this.checkAvailabilityPersonale();

  }
  checkAvailabilityPersonale() {
    LoggingService.log('controllo', LogLevel.warn, [this.dataInizioAssegnamento, this.dataFineAssegnamento]);
    // controllo che il personale scelto sia disponibile in quelle date
    let dataInizio = null;
    if (this.dataInizioAssegnamento) {
      dataInizio = this.dataInizioAssegnamento.toISOString();
    }
    LoggingService.log('datainizio iso', LogLevel.warn, dataInizio);
    let dataFine = null;
    if (this.dataFineAssegnamento) {
      dataFine = this.dataFineAssegnamento.toISOString().substring(0, 10);
    }
    LoggingService.log('date availability', LogLevel.debug, [dataInizio, dataFine]);

    if (dataInizio == null || dataFine == null || this.nuovopersonale.length == 0) {
      LoggingService.log('errore availability: manca data', LogLevel.warn, [this.dataInizioAssegnamento, this.dataFineAssegnamento]);
      this.available = -1;
      // return;
    }

    // abilito lo spinner nell'html impostando la variabile available a 0
    if (dataInizio != null && dataFine != null) {
      this.available = 0;
      this.service.getAvailabilityPersonaleCantiere(this.nuovopersonale, dataInizio, dataFine)
        .subscribe(
          (res) => {
            LoggingService.log('availability andato', LogLevel.debug, res);
            if (res.length == 0) {
              // tutte le persone aggiunte sono disponibili
              this.available = 1;
            } else if (res.length != 0) {
              this.notAvailable = 'Attenzione. Il seguente personale è già occupato nelle date inserite: ';
              this.available = 2;
              res.forEach((i) => {

                this.personaleget.forEach((element) => {
                  if (element.id == i) {
                    this.notAvailable = this.notAvailable + element.fullName + ', ';
                  }
                })

              })
            }
          },
          (err) => {
            LoggingService.log('errore availability', LogLevel.error, err);
          },
          () => {
          },
        )
    }
  }
  // funzione chiamata al click del tasto Conferma nel popup
  aggiungiPersonale() {
    
    LoggingService.log('il personale da aggiungere è ', LogLevel.debug, this.nuovopersonale);
    LoggingService.log('la data inizio è', LogLevel.debug, this.dataInizioAssegnamento);
    LoggingService.log('la data di fine è', LogLevel.debug, this.dataFineAssegnamento);
    if (this.nuovopersonale.length == 0) {
      return;
    }

    // chiamo la post personaleCantiere per aggiungere il personale
    if (this.dataInizioAssegnamento != null && this.dataFineAssegnamento != null) {
      this.service.postPersonaleCantiere(this.targetCantiereId, this.nuovopersonale, this.dataInizioAssegnamento.toDateString(), this.dataFineAssegnamento.toDateString())
        .subscribe(
          (res) => {
            // this.ritornoPostPersonale = res,
            swal.fire({
              title: 'Personale aggiunto al cantiere!',
              text: 'La persona è stata aggiunta nella tabella',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'

              },
              buttonsStyling: false,
              confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
            });
            // reimposto la variabile che controlla la disponibilità del personale a -1, cioe allo stato di partenza
            this.available = -1;
            this.aggiornatabella(res),
              this.personaleCantiere = [...this.personaleCantiere]
          },
          (err) => {
            LoggingService.log('errore nel post personale cantiere', LogLevel.warn, err)
          },
          () => { }
        )

      // ricarico la tabella personale

      // reinizializzo le due date
      this.dataInizioAssegnamento = null;
      this.dataFineAssegnamento = null;
    } else {
      this.service.postPersonaleCantiere(this.targetCantiereId, this.nuovopersonale, null, null)
        .subscribe(
          (res) => {
            // this.ritornoPostPersonale = res,
            swal.fire({
              title: 'Personale aggiunto al cantiere!',
              text: 'La persona è stata aggiunta nella tabella',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'

              },
              buttonsStyling: false,
              confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
            });
            // reimposto la variabile che controlla la disponibilità del personale a -1, cioe allo stato di partenza
            this.available = -1;
            this.aggiornatabella(res),
              this.personaleCantiere = [...this.personaleCantiere]
          },
          (err) => {
            LoggingService.log('errore nel post personale cantiere', LogLevel.warn, err);
          },
          () => {
            this.nuovopersonale = [];
          },
        )
    }
  }


  // chiamata quando si chiude il popup di aggiunta personale
  clearDateInserite() {
    this.dataFineAssegnamento = null;
    this.dataInizioAssegnamento = null;
  }

  private aggiornatabella(pers: ListaPersonaleAssegnatoDiCantiere[]) {
    this.personaleCantiere = this.personaleCantiere.concat(pers);
  }


  // //metodo per controllare lo stato delle checkbox(true o false)
  // onChange(nota_id: number, event: any) {
  //   //personale.nome equivale all'identificatore(l'elemento che identifica in modo univoco quel record della tabella)
  //   LoggingService.log('box selezionato personale', LogLevel.debug, [nota_id, event.target.checked]);

  //   // se ho selezionato l'elemento lo inserisco nell'array checked
  //   if (event.target.checked)
  //     this.checked.push(nota_id);
  //   else
  //     //altrimenti lo tolgo dall'array checked
  //     this.checked.splice(this.checked.indexOf(nota_id), 1);

  //   LoggingService.log('array di checkbox personale cantiere', LogLevel.debug, this.checked);
  // }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  ConfirmText() {

    let str: string;
    let str2 = 'Elimina il personale selezionato dal cantiere';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun personale selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare la persona selezionata dal cantiere?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' persone dal cantiere?';
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
        LoggingService.log('array di personale da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.service.deletePersonaleCantiere(this.targetCantiereId, this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)
              for (const persona of this.checked) {
                this.personaleCantiere.splice(
                  this.personaleCantiere.indexOf(
                    this.personaleCantiere.find(x => x.id == persona)
                  ),
                  1
                )
              }
              this.personaleCantiere = [...this.personaleCantiere];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'Il personale selezionato è stato cancellato',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'Il personale selezionato NON è stato cancellato',
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
