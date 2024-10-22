import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ColumnMode, DatatableComponent} from '@swimlane/ngx-datatable';
import {Cantiere, DatiFinanziari} from 'app/models/cantiere.model';
import {CantieriService} from 'app/shared/services/data/cantieri.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import localeIt from '@angular/common/locales/it';
import {registerLocaleData} from '@angular/common';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Cliente} from 'app/models/cliente.model';
import {ClientiService} from 'app/shared/services/data/clienti.service';
import swal from 'sweetalert2';
import {Personale} from 'app/models/personale.model';
import {PersonaleService} from 'app/shared/services/data/personale.service';
import {ContrattoService} from 'app/shared/services/data/contratti.service';
import {Contratto} from 'app/models/contratto.model';

import {FinancialCardService} from 'app/shared/services/data/financialCard.service';
import {addValoriAggiuntivi, removeValoriAggiuntivi} from '../../../models/valoriaggiuntivi.model';
import {PdfService} from '../../../shared/services/pdf.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-cantieri',
  templateUrl: './cantieri.component.html',
  styleUrls: ['./cantieri.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CantieriComponent implements OnInit, AfterViewInit, OnChanges {
  cantieri: Cantiere[];
  columnMode = ColumnMode;
  private tempData = [];

  // usata solo nella dashboard generale come scorciatoia per creare un report
  @Input() shortcut = false;
  @Output() report = new EventEmitter<Cantiere>();

  @ViewChild(DatatableComponent) table: DatatableComponent;

  // cantiere che si popolerà con le informazioni inserite nel form
  nuovocantiere: Cantiere = new Cantiere();
  // variabile che contiene lo stato scelto del nuovo cantiere
  statoselezionato: string;
  // elenco clienti
  clientiget: Cliente[] = []
  // id del cliente selezionato nel crea cantiere
  clienteselezionato: number;
  // contiene la lista di tutto il personale
  personale_get: Personale[];
  // contiene i pm selezionati nel crea cantiere
  pm_selezionati: number[];
  // contiene i capocantieri selezionati nel crea cantieri
  capocantieri_selezionati: number[];
  // elenco contratti
  contrattiget: Contratto[] = []
  // contiene l'id del contratto selezionato
  contrattoselezionato: number;
  // variabile usata per il filtro dello stato
  filtroStato: string = 'In corso'; // Imposta il valore iniziale
  // variabile utilizzata per creare una stringa di categorie SOA quando si crae un cantiere
  SOA = '';
  // variabile usata per l'elenco delle categorie SOA nel crea cantiere
  soa: { name: string }[] = [];

  // variabili usate per riordinare. Di default ordino usando la data di scadenza
  sortCol = 'id';
  sortDir = 'desc';
  // roba per il form
  cantiereFormIsValid = false;

  rigaSelezionata: number[];

  limit: number = 25;

  /**
   *
   * @param service
   * @param router servizio di routing iniettato da Angular
   */
  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private service: CantieriService, private router: Router, private modalService: NgbModal, private clienti: ClientiService, private servicepersonale: PersonaleService, private contrattiservice: ContrattoService, private datiFinanziariService: FinancialCardService) {
    // this.tempData=this.cantieri
  }

  // chiamata quando questo componente viene utilizzato come scorciatoia per creare un report
  ngOnChanges(changes: SimpleChanges): void {
    if (this.shortcut) {
      console.log('sto usando la tabella cantieri nella dashboard come scorciatoia');

    }
  }

  downloadPdf() {
    if (this.cantieri.length > this.limit) {

      let l = this.limit
      this.limit = this.cantieri.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-cantieri', `cantieri`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-cantieri', `cantieri`, null, this._spinner)
    }

  }

  ngAfterViewInit(): void {

    const tableRef = document.getElementById('ngx-datatable-cantieri');
    tableRef.click();
  }

  ngOnInit(): void {
    registerLocaleData(localeIt, 'it');

    this.service.getCantieri()
      .subscribe(
        (res) => {
          this.cantieri = res;
          this.service.cantieri = res;
          this.tempData = res;

          // Chiamata a filterUpdate per applicare il filtro iniziale
          this.filterUpdate(null);

          // TODO: Porcheria
          const tableRef = document.getElementById('ngx-datatable-cantieri');
          tableRef.click();
          if (this.shortcut) {
            // Controllo se sul localStorage ho salvato l'ultimo cantiere selezionato
            let lastCantiereClicked: string = localStorage.getItem('cantiereId');
            if (lastCantiereClicked) {
              var cantiere = this.cantieri.find(x => x.id == Number.parseInt(lastCantiereClicked));
              if (cantiere) {
                // Seleziono la riga sulla tabella corrispondente a questo cantiere
                this.table.selected = [cantiere];
                this.rowSelected({selected: this.table.selected});
              }
            }
          }
        },
        (err) => {
          LoggingService.log('errore nel recupero dei cantieri', LogLevel.warn, err);
        },
        () => {
          LoggingService.log('array cantieri estratti', LogLevel.debug, this.cantieri);
          // Scarico tutti i contratti
        }
      );

    this.contrattiservice.getAllContratti()
      .subscribe(
        (res) => {
          this.contrattiget = res;
        },
        (err) => {
          LoggingService.log('errore nel recupero dei contratti', LogLevel.error, err);
        },
        () => {
          LoggingService.log('array contratti estratto', LogLevel.debug, this.contrattiget);
        }
      );

    // Inizializzo i campi delle date del nuovo cantiere con la data odierna
    this.nuovocantiere.start = new Date(Date.now());
    this.nuovocantiere.estimatedEnding = new Date(Date.now());

    // Popolo l'array clientiget in modo da poter usare i clienti nel form del crea cantiere
    this.clienti.getAllClienti()
      .subscribe(
        (res) => {
          this.clientiget = res;
        },
        (err) => {
          LoggingService.log('errore nel recupero dei clienti', LogLevel.warn, err);
        },
        () => {
          LoggingService.log('array clienti estratti', LogLevel.debug, this.clientiget);
          // this.cantieri.forEach((cantiere) => {
          //   var idCl = cantiere.idClienti;
          //   var cliente = this.clientiget.find(x => x.id = idCl);
          //   cantiere.cliente = cliente;
          // });
        }
      );

    // Popolo l'array personale_get in modo da poter usare il personale nel form del crea cantiere
    this.servicepersonale.getAllPersonale()
      .subscribe(
        (res) => {
          this.personale_get = res;
        },
        (err) => {
          LoggingService.log('errore nel recupero del personale', LogLevel.warn, err);
        },
        () => {
          LoggingService.log('array personale estratto', LogLevel.debug, this.personale_get);
          // Popolo il campo fullname con una semplice concatenazione di due stringhe
          this.personale_get.forEach(i => {
            i.fullName = i.name + ' ' + i.surname;
          });
        }
      );
  }

  // funzione chiamata quando si riordina la tabella usando gli header delle colonne
  sort(event) {
    LoggingService.log('sortato', LogLevel.debug, event);
    this.sortCol = event.sorts[0].prop;
    this.sortDir = event.sorts[0].dir;
  }

  // chiamata ogni volta che viene cambiata la categoria SOA
  categoriaSOA(event) {
    console.log(event);
    this.SOA = '';

    event.forEach(element => {
      this.SOA = this.SOA.concat(element.name + '$%');
    });
  }

  // chiamata quando nel crea cantiere viene selezionato un contratto
  riempiSoa(event: Contratto) {
    console.log('contratto selezionato', event);
    this.soa = [];
    if (event != undefined && event.soa && event.soa.length > 0) {
      console.log('SOAAA', event.soa);

      let index = 0;
      for (let i = 0; i < event.soa.length; i++) {
        const char = event.soa.charAt(i);
        if (char == '$' && event.soa.charAt(i + 1) == '%') {

          this.soa.push({name: event.soa.substring(index, i)});
          index = i + 2;
        }
      }
      console.log('SOAAA', this.soa);
      this.soa = [...this.soa];
      return;
    } else {
      this.soa = [];
    }
  }

  // funzione chiamata quando si clicca su una riga
  rowClick(event) {
    if (event.type == 'dblclick') {
      // se mi trovo nella main dashboard non devo permettere di entrare nella dashboard cantiere
      if (!this.shortcut) {
        this.onEdit(event.row)
      }
    }
    if (event.type == 'click') {
      console.log('Ho selezionato una riga', event.row);
      localStorage.setItem('cantiereId', event.row.id);
    }
  }

  // Funzione chiamata alla selezione del filtro stato
  filterStato() {
    const sts = this.filtroStato;
    LoggingService.log('stato è', LogLevel.debug, sts);

    const temp = this.tempData.filter(function (d) {
      // Controllo se lo stato corrisponde o se il filtro è vuoto
      return d.state.indexOf(sts) !== -1 || !sts;
    });
    return temp;
  }

  // Funzione chiamata al filtro Cerca in alto nella tabella
  filterUpdate(event) {
    let val;
    if (event) {
      // Aggiornamento controllo stato
      if (event.target.id === 'status-select') {
        // svuoto controllo ricerca
        (document.getElementById('filtroMulticampo') as HTMLInputElement).value = null;
      } else {
        val = event.target.value.toLowerCase();
      }
    }
    // Filtra i dati in base allo stato
    let temp = this.filterStato();

    LoggingService.log('filtro cantieri', LogLevel.debug, this.tempData);
    if (val) {
      temp = temp.filter(
        (v, i, a) => {
          // Suppongo di default di escluderlo
          let accept = false;

          if (v.description.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }
          if (v.orderCode.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }

          return accept;
        }
      );
    }
    // Aggiorna i dati visualizzati
    this.cantieri = temp;
  }

  // funzione chiamata alla pressione del bottone posto su ogni riga della tabella
  onEdit(target: Cantiere) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/cantieri/', target.id]);
  }

  // metodo utilizzato dal tasto "crea cantiere" per aprire un popup
  openLg(content) {

    this.modalService.open(content, {size: 'xl', scrollable: true});
  }

  // chiamata quando si seleziona una riga
  // UTILIZZATA SOLO QUANDO LA TABELLA È USATA COME SCORCIATOIA NELLA DASHBOARD
  rowSelected(event) {
    if (this.shortcut) {
      console.log('riga selezionata', event);
      this.report.emit(event.selected[0]);
    }

  }

  // //funzione che raccoglie alcuni input inseriti nel form di crea cantiere
  // addDatiCantiere(event) {
  //   const target = event.target.value;
  //   const placeholder = event.target.attributes.placeholder.nodeValue;
  //   // LoggingService.log('dato nota inserito', LogLevel.debug,event);

  //   if (placeholder.toLowerCase() == "indirizzo") {
  //     // LoggingService.log('indirizzo cantiere nuovo', LogLevel.debug, target)
  //     this.nuovocantiere.address = target;
  //     // LoggingService.log('nuovanota', LogLevel.debug,this.nuovanota);
  //   }

  //   if (placeholder.toLowerCase() == "codice commessa") {
  //     // LoggingService.log('nome cliente', LogLevel.debug, target)
  //     this.nuovocantiere.orderCode = target;
  //   }
  //   if (placeholder.toLowerCase() == "cig") {
  //     // LoggingService.log('nome cliente', LogLevel.debug, target)
  //     this.nuovocantiere.cig = target;
  //   }
  //   if (placeholder.toLowerCase() == "cup") {
  //     // LoggingService.log('nome cliente', LogLevel.debug, target)
  //     this.nuovocantiere.cup = target;
  //   }
  //   if (placeholder.toLowerCase() == "oda/rdo") {
  //     // LoggingService.log('nome cliente', LogLevel.debug, target)
  //     this.nuovocantiere.oda = target;
  //   }
  //   if (placeholder.toLowerCase() == "digita l'ammontare") {
  //     // LoggingService.log('nome cliente', LogLevel.debug, target)
  //     this.nuovocantiere.budget = target;
  //   }

  //   //questi due if vengono innescati quando l'utente scrive la data a mano senza usare il datepicker
  //   //NON INSERIAMO PIU LE DATE A MANO QUINDI QUESTA PARTE DI CODICE È COMMENTATA PERCHÈ INUTILE
  //   // if (placeholder.toLowerCase() == "inizio") {
  //   //   LoggingService.log('data di inizio scritta a mano', LogLevel.debug, target)

  //   //   const data = new Date();
  //   //   data.setFullYear(target.substring(6, 10), target.substring(3, 5) - 1, target.substring(0, 2));
  //   //   this.nuovocantiere.start = data;
  //   // }
  //   // if (placeholder.toLowerCase() == "fine stimata") {
  //   //   LoggingService.log('data di termine scritta a mano', LogLevel.debug, target)

  //   //   const data = new Date();
  //   //   data.setFullYear(target.substring(6, 10), target.substring(3, 5) - 1, target.substring(0, 2));
  //   //   this.nuovocantiere.estimatedEnding = data;
  //   // }

  // }

  // funzione utilizzata dai datepicker
  cambia(event, binding: string, otherdata: any = null) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8))
    switch (binding) {
      case 'datainizio': {
        this.nuovocantiere.start = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di inizio del nuovo cantiere è', LogLevel.debug, this.nuovocantiere.start);
        break;
      }
      case 'dataFineStimata': {
        this.nuovocantiere.estimatedEnding = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di fine del nuovo cantiere è', LogLevel.debug, this.nuovocantiere.estimatedEnding);
        break;
      }
      case 'datacantiere': {
        if (event.year == null && event.month == null && event.day == null) {
          otherdata.data = null

          return
        }
        otherdata.data = new Date(event.year, event.month, event.day, ore, minuti, secondi);

        break;
      }
      case 'datacantiere': {
        if (event.year == null && event.month == null && event.day == null) {
          otherdata.data = null

          return
        }
        otherdata.data = new Date(event.year, event.month, event.day, ore, minuti, secondi);

        break;
      }
      default: {
        // statements;
        break;
      }
    }

  }

  // chiamata quando si salva come bozza
  creaCantiereBozza() {
    this.nuovocantiere.state = 'Bozza';
    this.creaCantiere();
  }

  creaCantiere() {
    LoggingService.log('il cliente del cantiere è', LogLevel.debug, this.clienteselezionato)
    // metodo per postare un nuovo cantiere e aggiornare la tabella
    LoggingService.log('i PM del cantiere sono', LogLevel.debug, this.pm_selezionati)
    LoggingService.log('i capocantieri del cantiere sono', LogLevel.debug, this.capocantieri_selezionati)
    LoggingService.log('il nuovo cantiere è', LogLevel.debug, this.nuovocantiere);

    this.nuovocantiere.idClienti = this.clienteselezionato;
    this.nuovocantiere.soa = this.SOA;

    this.nuovocantiere = {...this.nuovocantiere}
    this.service.createCantiere(this.nuovocantiere)
      .subscribe(
        (res) => {
          this.nuovocantiere.id = res;
          this.cantieri.unshift(this.nuovocantiere);
          LoggingService.log('appena postato', LogLevel.warn, [this.nuovocantiere, this.cantieri]);
          this.cantieri = [...this.cantieri];
          this.postaCapicantiere(this.nuovocantiere.id);
          this.postaPMsCantiere(this.nuovocantiere.id);

          // QUESTA È UNA CHICCA
          this.ngOnInit();
          // popur di avvenuta creazione del cantiere
          this.TypeSuccess();
          const datiFinanziari: DatiFinanziari = {
            creditiVsClienti: 0,
            daContabilizzare: '0',
            daFatturare: '0',
            daIncassare: '0',
            debitiABreve: '0',
            anticipazioniDaRestituire: '0',
            debitiVsFornitori: 0,
            paghe: '0',
            fattureRicevute: '0',
            fattureDaRicevere: '0',
            saldo: 0,
            proxSal: '0',
            cashflow: 0
          };

          datiFinanziari.idCantiere = res;

          (datiFinanziari.debitiVsFornitori as unknown as string) = '0';

          // this.datiFinanziariService.createFinancialCard(datiFinanziari).subscribe(
          //   (res) => {
          //     console.log('creati dati finanziari', res);
          //   },
          //   (err) => {
          //     console.error('ERRORE creazione dati finanziari', err);
          //   },
          // )

        },
        (err) => {
          LoggingService.log('errore nella creazione del nuovo cantiere', LogLevel.warn, err);
          // popup di errore
          this.TypeError()

        },
        () => {
          LoggingService.log('nuovo cantiere creato', LogLevel.debug, this.nuovocantiere.id),
            this.pm_selezionati = null,
            this.capocantieri_selezionati = [],
            delete this.nuovocantiere.id;
        }
      );
  }

  deleteCantiere(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il cantiere selezionato';
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
            this.service.deleteCantiere(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('cantiere eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il cantiere selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione cantiere', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il cantiere selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.cantieri.splice(
                    this.cantieri.indexOf(
                      this.cantieri.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.cantieri = [...this.cantieri];
                  this.tempData = this.cantieri;
                }
              )
            // eliminiamo il cantiere selezione
            // this.noteservice.deleteNote(this.checked)
            //   .subscribe(
            //     (res) => {
            //       // logica gestione array
            //       for (let nota of this.checked) {
            //         this.note.splice(
            //           this.note.indexOf(
            //             this.note.find(x => x.nota.id == nota)
            //           ),
            //           1
            //         )
            //       }
            //       //ricarico la tabella
            //       this.note = [...this.note];
            //       //reinizializzo i due array legati alle checkbox
            //       this.checked = [];
            //       this.selected = [];

            //       swal.fire({
            //         icon: "success",
            //         title: 'Fatto!',
            //         text: 'Le note selezionate sono state cancellate',
            //         customClass: {
            //           confirmButton: 'btn btn-success'
            //         },
            //       });
            //     },
            //     (err) => {
            //       swal.fire({
            //         icon: "error",
            //         title: 'C\'è stato un problema!',
            //         text: 'Le note selezionate NON sono state cancellate',
            //         customClass: {
            //           confirmButton: 'btn btn-danger'
            //         }
            //       });
            //     },
            //     () => { }
            //   )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  TypeSuccess() {
    swal.fire({
      title: 'Cantiere Creato!',
      text: 'Il cantiere è stato aggiunto nella tabella',
      icon: 'success',
      customClass: {
        confirmButton: 'btn btn-primary'

      },
      buttonsStyling: false,
      confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
    });
    // reinizializzo nuovocantiere chiamando il costruttore
    this.nuovocantiere = new Cantiere();
    this.clienteselezionato = null;
    // this.pm_selezionati = [];
    this.statoselezionato = '';
    // this.capocantieri_selezionati = [];
  }

  TypeError() {
    swal.fire({
      icon: 'error',
      title: 'C\'è stato un problema!',
      text: 'Il cantiere NON è stato creato. Riprova riempiendo tutti i campi.',
      customClass: {
        confirmButton: 'btn btn-danger'
      }
    });
  }

  private postaCapicantiere(cantiereId: number) {
    this.service.postForemen(this.capocantieri_selezionati, this.nuovocantiere.id)
      .subscribe(
        (res) => {
          LoggingService.log('capicantiere aggiunti al nuovo cantiere', LogLevel.debug, res)
        },
        (err) => {
          LoggingService.log('errore nel post dei capicantiere del nuovo cantiere', LogLevel.warn, err)
        },
        () => {
          LoggingService.log('capicantiere aggiunti al nuovo cantiere', LogLevel.debug,)
        }
      );
  }

  private postaPMsCantiere(cantiereId: number) {
    this.service.postPMsCantiere(this.pm_selezionati, this.nuovocantiere.id)
      .subscribe(
        (res) => {
          LoggingService.log('PMs aggiunti al nuovo cantiere', LogLevel.debug, res)
        },
        (err) => {
          LoggingService.log('errore nel post dei PMs del nuovo cantiere', LogLevel.warn, err)
        },
        () => {
        }
      );
  }

  // calcolo i campi IMPORTO COMMESSA e IMPORTO FINALE
  validationForm(form) {
    // calcolo importo commessa
    if (this.nuovocantiere.workBudget == null && this.nuovocantiere.chargesBudget == null) {
      this.nuovocantiere.orderAmount = null;
    }

    this.nuovocantiere.orderAmount = (this.nuovocantiere.workBudget ?? 0) + (this.nuovocantiere.chargesBudget ?? 0);

    // 2 cifre decimali
    if (this.nuovocantiere.orderAmount) {
      this.nuovocantiere.orderAmount = Number.parseFloat(this.nuovocantiere.orderAmount.toFixed(2));
    }

    // calcolo importo finale

    this.nuovocantiere.totalGrossWorkAmount = this.nuovocantiere.workBudget ?? 0
    this.nuovocantiere.totalChargesAmount = this.nuovocantiere.chargesBudget ?? 0

    this.nuovocantiere.finalAmount = this.nuovocantiere.totalGrossWorkAmount + this.nuovocantiere.totalChargesAmount

    for (let valAgg of this.nuovocantiere.valoriAggiuntivi) {

      valAgg.additionalNetAmount = valAgg.additionalChargesAmount + valAgg.additionalGrossWorkAmount

      this.nuovocantiere.totalGrossWorkAmount += valAgg.additionalGrossWorkAmount
      this.nuovocantiere.finalAmount += valAgg.additionalNetAmount
      this.nuovocantiere.totalChargesAmount += valAgg.additionalChargesAmount

    }

    // 2 cifre decimali
    if (this.nuovocantiere.finalAmount) {
      this.nuovocantiere.finalAmount = Number.parseFloat(this.nuovocantiere.finalAmount.toFixed(2));
    }

    LoggingService.log('form', LogLevel.debug, form)
    if (form.status == 'VALID') {
      this.cantiereFormIsValid = true;
      return;
    } else {
      this.cantiereFormIsValid = false
      return;
    }
  }

  protected readonly addValoriAggiuntivi = addValoriAggiuntivi;
  protected readonly removeValoriAggiuntivi = removeValoriAggiuntivi;

  isLastIndex(i: number): boolean {
    return this.nuovocantiere.valoriAggiuntivi.length === 0 || i === this.nuovocantiere.valoriAggiuntivi.length - 1;
  }

}
