import {ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {PrezziarioGenerale} from 'app/models/benieservizi.model';
import {ServiziClienteService} from 'app/shared/services/data/servizicliente.service';
import {PrezziarioGeneraleService} from 'app/shared/services/data/prezziariogenerale.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {Cliente} from 'app/models/cliente.model';
import {ClientiService} from 'app/shared/services/data/clienti.service';
import {PdfService} from '../../../shared/services/pdf.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-prezziari-generali',
  templateUrl: './prezziari-generali.component.html',
  styleUrls: ['./prezziari-generali.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrezziariGeneraliComponent implements OnInit {
  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // elenco clienti
  clientiget: Cliente[] = []

  // array che contiene i servizi relativi a questo cantiere
  prezziariGenerali: PrezziarioGenerale[] = [];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un servizio da aggiungere al cantiere
  nuovoprezziario = new PrezziarioGenerale();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile usata nel form di creazione
  fff = false;

  limit: number = 25;

  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private modalService: NgbModal, private serviziClienti: ServiziClienteService, private router: Router, private prezziarigeneraliservice: PrezziarioGeneraleService,
              private _clientiService: ClientiService) {
    // var p = new PrezziarioGenerale();
    // p.id = 300;
    // p.name = "prezziario 1";
    // p.type = "inutile";
    // p.validationYear = "2020"
    // this.prezziariGenerali[0] = p;
    // this.prezziariGenerali[1] = { id: 301, name: 'prezziario 2', type: 'xxxxx', validationYear: '2022' };
  }

  ngOnInit(): void {
    this.prezziarigeneraliservice.getAllPrezziariGenerali()
      .subscribe(
        (res) => {
          LoggingService.log('get prezziari generali ok', LogLevel.debug, res)
          this.prezziariGenerali = res;
          document.getElementById('ngx-datatable-prezziario').click();

        },
        (err) => {
          LoggingService.log('ERRORE get prezziari generali', LogLevel.error, err)
        },
        () => {
          this.tempData = this.prezziariGenerali;
        },
      )

    // popolo l'array clientiget in modo da poter usare i clienti nel form del crea cantiere
    this._clientiService.getAllClienti()
      .subscribe(
        (res) => {
          this.clientiget = res
        },
        (err) => {
          LoggingService.log('errore nel recupero dei clienti', LogLevel.warn, err)
        },
        () => {
          LoggingService.log('array cienti estratti', LogLevel.debug, this.clientiget)
        }
      );
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    let temp = this.tempData;
    if (val) {
      // Filtro i dati se il controllo è valorizzato
      temp = temp.filter(
        (v, i, a) => {
          // Suppongo di default di escluderlo
          let accept = false;
          // se accept è true prendo l'elemento v, altrimenti non lo prendo

          // Filtro per nome, se lo trovo lo aggiungo alla lista
          // il nome potrebbe essere null
          if (v.name && v.name.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }
          // Filtro per tipo, se lo trovo lo aggiungo alla lista
          // il tipo potrebbe essere null
          if (v.type && v.type.toLowerCase().indexOf(val) !== -1) {
            accept = true;
          }

          return accept;
        }
      );
    }
    this.prezziariGenerali = temp;
  }

  // chiamata al click della riga sulla tabella
  rowClick(event) {
    if (event.type == 'dblclick') {

      this.router.navigate(['/page/tables/prezziario/', event.row.id]);
    }
  }

  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {size: 'lg'});
  }

  // funzione chiamata alla pressione del bottone posto su ogni riga della tabella
  // NON USATA ATTUALMENTE
  onView(target: PrezziarioGenerale) {
    LoggingService.log('apro il prezziario ', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/tables/prezziario/', target.id]);
  }

  // chiamata alla modifica del prezzario generale
  onModify(target: PrezziarioGenerale, content) {
    LoggingService.log('modifico il prezziario ', LogLevel.debug, target);
    // passo il riferimento con l'" = ", quindi quando aggiornerò in automatico
    // verrà modificata la riga corrispondente della tabella
    this.nuovoprezziario = target;

    this.modalService.open(content, {size: 'lg'});

  }

  // funzione chiamata in seguito alla selezione di una checkbox
  // NON UTILIZZATA
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  aggiungiPrezziarioGenerale() {

    LoggingService.log('nuovoservizio:', LogLevel.debug, this.nuovoprezziario);
    this.prezziarigeneraliservice.postPrezziarioGenerale(this.nuovoprezziario)
      .subscribe(
        (res) => {
          this.nuovoprezziario.id = res.id;
          const cliente = this.clientiget.find(e => e.id == this.nuovoprezziario.idCliente);
          this.nuovoprezziario.clienteName = cliente.name;

          LoggingService.log('nuovo prezziario generale postato con successo', LogLevel.debug, res);
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
          LoggingService.log('errore post nuovo prezziario generale ', LogLevel.error, err);
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
          this.prezziariGenerali.unshift(this.nuovoprezziario);
          this.prezziariGenerali = [...this.prezziariGenerali];
          this.clearData();
          this.tempData = this.prezziariGenerali;
        },
      )
  }

  updatePrezzarioGenerale() {
    LoggingService.log('nuovo prezzario da aggiornare:', LogLevel.debug, this.nuovoprezziario);
    this.prezziarigeneraliservice.updatePrezziario(this.nuovoprezziario.id, this.nuovoprezziario).subscribe(
      (res) => {

        LoggingService.log('prezziario generale aggiornato con successo', LogLevel.debug, res);

        const cliente = this.clientiget.find(e => e.id == this.nuovoprezziario.idCliente);
        this.nuovoprezziario.clienteName = cliente.name;

        swal.fire({
          title: 'Elemento Aggiornato!',
          text: 'Il prezzario è stato aggiornato',
          icon: 'success',
          customClass: {
            confirmButton: 'btn btn-primary'

          },
          buttonsStyling: false,
          confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
        });
      },
      (err) => {
        LoggingService.log('errore update prezzario generale ', LogLevel.error, err);
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Il Prezzario NON è stato creato.',
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

  clearData() {
    this.nuovoprezziario = new PrezziarioGenerale();
  }

  downloadPdf() {
    if (this.prezziariGenerali.length > this.limit) {

      let l = this.limit
      this.limit = this.prezziariGenerali.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-prezziario', `prezzari`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-prezziario', `prezzari`, null, this._spinner)
    }

  }

  deletePrezziarioGenerale(prezziario: PrezziarioGenerale) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, prezziario);
    const str = 'Elimina il prezzario selezionato';
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
            LoggingService.log('sto per eliminare il prezziario generale con id:', LogLevel.debug, prezziario.id)
            this.prezziarigeneraliservice.deletePrezziario(prezziario.id)
              .subscribe(
                (res) => {
                  LoggingService.log('prezziario generale eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il prezziario generale selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione prezziario', LogLevel.error, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il prezziario selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.prezziariGenerali.splice(
                    this.prezziariGenerali.indexOf(
                      this.prezziariGenerali.find(x => x.id == prezziario.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.prezziariGenerali = [...this.prezziariGenerali];
                  this.tempData = this.prezziariGenerali;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  // funzione utilizzata per convalidare o meno il form di modifica del contratto
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

}
