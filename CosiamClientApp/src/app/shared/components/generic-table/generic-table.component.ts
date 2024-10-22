import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Contratto } from 'app/models/contratto.model';
import { _File } from 'app/models/file.model';
import { Note } from 'app/models/note.model';
import { ScadenzePersonale } from 'app/models/personale.model';
import { TaggedNota } from 'app/models/taggednota.model';
import { MezziService } from 'app/shared/services/data/mezzi.service';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenericTableComponent implements OnInit {

  // variabile che contiene il titolo che avrà la tabella
  @Input() titolo: string;
  @Input() idPersonale: number;


  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // array che contiene gli id dei mezzi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che conterrà la lista dei dati a seconda del titolo
  rows;
  // variabile che contiene il nuovo record da creare
  nuovorecord = new ScadenzePersonale();
  // variabili usata quando viene aggiunto un file alla creazione di una nota
  fileName = '';
  formData = new FormData();
  // variabile usata per decidere se mostrare le scadenze chiuse oppure no
  showClosed = false;
  // variabili usate per riordinare. Di default ordino usando la data di scadenza
  sortCol = 'nota.nota.dueDate';
  sortDir = 'asc';


  Amministrazione: ScadenzePersonale[] = [];
  HSE = [];
  Patenti = [];
  CorsiDiFormazione = [];
  Sanitario = [];

  constructor(private spinner: NgxSpinnerService, private modalService: NgbModal, private personaleservice: PersonaleService, private mezziservice: MezziService) {
    this.nuovorecord.nota = new TaggedNota();
    this.nuovorecord.nota.nota = new Note();
  }

  // funzione chiamata quando si riordina la tabella usando gli header delle colonne
  sort(event) {
    LoggingService.log('sortato', LogLevel.debug, event);
    this.sortCol = event.sorts[0].prop;
    this.sortDir = event.sorts[0].dir;
  }

  ngOnInit(): void {

    LoggingService.log('titolo', LogLevel.debug, this.titolo);
    this.rowSelector();
    if (this.idPersonale) {
      this.personaleservice.getScadenzePersonale(this.idPersonale)
        .subscribe(
          (res: ScadenzePersonale[]) => {
            LoggingService.log('Scadenze ottenute', LogLevel.debug, res);
            res.forEach(element => {
              switch (element.nota.nota.description) {
                case 'Amministrazione': {
                  this.Amministrazione.push(element);
                  break;
                }
                case 'HSE': {
                  this.HSE.push(element);
                  break;
                }
                case 'Patenti': {
                  this.Patenti.push(element);
                  break;
                }
                case 'Corsi di formazione': {
                  this.CorsiDiFormazione.push(element);
                  break;
                }
                case 'Sanitario': {
                  this.Sanitario.push(element);
                  break;
                }
                default: {
                  LoggingService.log('Errore description get scadenze', LogLevel.error, res);
                  break;
                }
              }
            });
          },
          (err) => {
            LoggingService.log('ERRORE get Scandenze', LogLevel.error, err);
          },
          () => {

            this.Amministrazione = [...this.Amministrazione];
            this.HSE = [...this.HSE];
            this.Patenti = [...this.Patenti];
            this.CorsiDiFormazione = [...this.CorsiDiFormazione];
            this.Sanitario = [...this.Sanitario];
            this.rowSelector();
          },
        )
    }

  }
  // chiamata ogni volta che il titolo cambia, cioè ogni volta che si cambia tab
  ngOnChanges() {
    LoggingService.log('row cambiata', LogLevel.debug);
    this.rowSelector();
    // document.getElementById('ngx-datatable').click();

  }
  // filtro
  filterUpdate(event) {
    LoggingService.log('tempdata è', LogLevel.debug, this.tempData)
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.nota.nota.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    LoggingService.log('filtro nome', LogLevel.debug, temp)
    // aggiorna le righe della tabella dopo il filtraggio
    this.rows = temp;
  }


  // metodo utilizzato dal tasto "aggiungi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, { size: 'xl' });
  }
  // chiamata alla modifica di una scadenza
  modifyRecord(event: ScadenzePersonale, content) {
    this.nuovorecord = JSON.parse(JSON.stringify(event));
    this.nuovorecord.nota.listFile = [];
    console.log('richiesta modifica per scadenza:', this.nuovorecord)
    this.modalService.open(content, { size: 'xl' });
  }
  mostraScadenzeChiuse() {
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.Amministrazione = [];
    this.HSE = [];
    this.Patenti = [];
    this.CorsiDiFormazione = [];
    this.Sanitario = [];

    this.personaleservice.getScadenzePersonaleFiltered(this.idPersonale, this.showClosed, null, null)
      .subscribe(
        (res: ScadenzePersonale[]) => {
          LoggingService.log('Scadenze ottenute dopo aver cliccato la checkbox ', LogLevel.debug, res);
          res.forEach(element => {
            switch (element.nota.nota.description) {
              case 'Amministrazione': {
                this.Amministrazione.unshift(element);
                break;
              }
              case 'HSE': {
                this.HSE.unshift(element);
                break;
              }
              case 'Patenti': {
                this.Patenti.unshift(element);
                break;
              }
              case 'Corsi di formazione': {
                this.CorsiDiFormazione.unshift(element);
                break;
              }
              case 'Sanitario': {
                this.Sanitario.unshift(element);
                break;
              }
              default: {
                LoggingService.log('Errore description get scadenze', LogLevel.error, res);
                break;
              }
            }
            this.spinner.hide();
          });
        },
        (err) => {
          LoggingService.log('ERRORE get Scandenze', LogLevel.error, err);
          this.spinner.hide();
        },
        () => {

          this.Amministrazione = [...this.Amministrazione];
          this.HSE = [...this.HSE];
          this.Patenti = [...this.Patenti];
          this.CorsiDiFormazione = [...this.CorsiDiFormazione];
          this.Sanitario = [...this.Sanitario];
          this.rowSelector();
          document.getElementById('ngx-datatable').click();
          this.spinner.hide();
        },
      )
  }
  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }
  updateStatoScandenza(event: ScadenzePersonale) {
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('cambia stato scadenza', LogLevel.debug, event);
    this.personaleservice.changeScadenzaStatus(event.id, event.nota.nota.state)
      .subscribe(
        (res) => {
          LoggingService.log('cambiato stato scadenza', LogLevel.debug, res);
          this.spinner.hide();
        },
        (err) => {
          LoggingService.log('ERRORE cambio stato scadenza', LogLevel.debug, err);
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        },
      )

  }
  CreaRecord(title: string) {
    // attivo lo spinner
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('crea record titolo:', LogLevel.debug, title);
    this.nuovorecord.nota.nota.description = this.titolo; // cosi specifico in quale tabella stiamo lavorando, ad esempio HSE o amministrazioneo altro
    this.nuovorecord.idPersonale = this.idPersonale;
    // this.nuovorecord.id=null;

    LoggingService.log('nuovorecord prima', LogLevel.debug, this.nuovorecord);

    this.personaleservice.postScadenzaPersonale(this.nuovorecord)
      .subscribe(
        (res) => {
          LoggingService.log('post nuova scadenza avvenuto con successo', LogLevel.debug, res);
          this.nuovorecord = res;
          if (this.formData.getAll('formFiles').length > 0) {
            this.postaAllegati();
            // refresho la tabella dentro la funzione postaAllegati
          } else {
            this.refreshtable(res);
          }
        },
        (err) => {
          LoggingService.log('ERRORE post nuova scadenza', LogLevel.error, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il record NON è stato aggiunto',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => { },
      )
  }
  postaAllegati() {
    this.personaleservice.postAttachmentScadenza(this.nuovorecord.id, this.formData)
      .subscribe(
        (res) => {
          LoggingService.log('risposta post file allegato nota', LogLevel.debug, res);
          this.nuovorecord.nota.listFile = []; // lo faccio per evitare che sia undefined
          res.forEach(element => {
            this.nuovorecord.nota.listFile.push(element.file)
          })
          this.refreshtable(this.nuovorecord);
        },
        (err) => {
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il record è stato creato ma NON è stato possibile aggiungere il/gli allegati. La pagina verrà aggiornata.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          }).then(() => {
            location.reload();
          });
        },
        () => {
          this.formData = new FormData();
          this.fileName = '';
        },
      )
  }
  // metodo chiamato alla conferma della modifica di una scadenza
  UpdateScadenza(title: String) {
    // attivo lo spinner
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('modifica scadenza:', LogLevel.debug, this.nuovorecord);

    const nota = this.nuovorecord.nota.nota;
    this.personaleservice.updateScadenza(this.nuovorecord.id, {
      id: this.nuovorecord.id,
      performingDate: this.nuovorecord.performingDate,
      idPersonale: this.nuovorecord.idPersonale,
      idNote: this.nuovorecord.idNote,
      nota
    })
      .subscribe(
        (res) => {

          // res ritorna solo uno status code
          LoggingService.log('update scadenza avvenuto con successo', LogLevel.debug, res);
          if (this.formData.getAll('formFiles').length > 0) {
            this.personaleservice.postAttachmentScadenza(this.nuovorecord.id, this.formData)
              .subscribe(
                (res) => {
                  LoggingService.log('risposta post file allegato nota', LogLevel.debug, res);
                  this.formData = new FormData();
                  this.fileName = '';
                  this.spinner.hide();
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'La scadenza è stata modificata, compresi gli allegati. La pagina verrà ricaricata.',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  }).then(() => {
                    location.reload();
                  }
                  )

                },
                (err) => {
                  LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
                  this.spinner.hide();
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Non è stato possibile aggiornare il/gli allegati',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {

                },
              )
          } else {
            this.spinner.hide();
            swal.fire({
              icon: 'success',
              title: 'Fatto!',
              text: 'La scadenza è stata modificata. La pagina verrà ricaricata.',
              customClass: {
                confirmButton: 'btn btn-success'
              },
            }).then(() => {
              location.reload();
            })
          }

        },
        (err) => {
          LoggingService.log('ERRORE update scadenza', LogLevel.error, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il record NON è stato modificato',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => { },
      )

  }
  // funzione chiamata in automatico quando si posta una nuova scadenza
  refreshtable(res: ScadenzePersonale) {
    switch (res.nota.nota.description) {
      case 'Amministrazione': {
        this.Amministrazione.unshift(this.nuovorecord);
        this.Amministrazione = [...this.Amministrazione];
        break;
      }
      case 'HSE': {
        this.HSE.unshift(this.nuovorecord);
        this.HSE = [...this.HSE];
        break;
      }
      case 'Patenti': {
        LoggingService.log('nuovorecord patenti', LogLevel.warn, this.nuovorecord);
        this.Patenti.unshift(this.nuovorecord);
        this.Patenti = [...this.Patenti];
        break;
      }
      case 'Corsi di formazione': {
        this.CorsiDiFormazione.unshift(this.nuovorecord);
        this.CorsiDiFormazione = [...this.CorsiDiFormazione];
        break;
      }
      case 'Sanitario': {
        this.Sanitario.unshift(this.nuovorecord);
        this.Sanitario = [...this.Sanitario];
        break;
      }
      default:
        break;
    }
    this.spinner.hide();

    swal.fire({
      icon: 'success',
      title: 'Fatto!',
      text: 'Il record è stato aggiunto!',
      customClass: {
        confirmButton: 'btn btn-success'
      },
    });

    this.nuovorecord = new ScadenzePersonale();
    this.nuovorecord.nota = new TaggedNota();
    this.nuovorecord.nota.nota = new Note();
    this.rowSelector();
  }
  // chiamata alla chiusura del popup di modifica di una scadenza
  clearData() {
    this.nuovorecord = new ScadenzePersonale();
    this.nuovorecord.nota = new TaggedNota();
    this.nuovorecord.nota.nota = new Note();
  }
  // funzione chiamata quando si vuole eliminare un allegato da un record di tabella
  deleteAttachment(allegato: ScadenzePersonale, index: number) {
    LoggingService.log('allegato da eliminare', LogLevel.debug, [allegato, index])
    const id = [];
    id.push(allegato.nota.listFile[index].id);

    let ret;
    const str = 'Elimina l\'allegato selezionato';
    const check = true;
    const text = 'L\'azione è irreversibile';
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
            this.personaleservice.deleteAttachmentScadenza(id)
              .subscribe(
                (res) => {
                  LoggingService.log('allegato eliminato', LogLevel.debug, res);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'L\'allegato è stato eliminato!',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('ERRORE delete allegato', LogLevel.error, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'L\'allegato NON è stato eliminato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  switch (allegato.nota.nota.description) {
                    case 'Amministrazione': {
                      const y = this.Amministrazione.findIndex(x => x.id == allegato.id);
                      LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                      this.Amministrazione[y].nota.listFile.splice(index, 1);
                      LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.Amministrazione);
                      this.Amministrazione = [...this.Amministrazione];
                      break;
                    }
                    case 'HSE': {
                      const y = this.HSE.findIndex(x => x.id == allegato.id);
                      LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                      this.HSE[y].nota.listFile.splice(index, 1);
                      LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.HSE);
                      this.HSE = [...this.HSE];
                      break;
                    }
                    case 'Patenti': {
                      const y = this.Patenti.findIndex(x => x.id == allegato.id);
                      LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                      this.Patenti[y].nota.listFile.splice(index, 1);
                      LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.Patenti);
                      this.Patenti = [...this.Patenti];
                      break;
                    }
                    case 'Corsi di formazione': {
                      const y = this.CorsiDiFormazione.findIndex(x => x.id == allegato.id);
                      LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                      this.CorsiDiFormazione[y].nota.listFile.splice(index, 1);
                      LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.CorsiDiFormazione);
                      this.CorsiDiFormazione = [...this.CorsiDiFormazione];
                      break;
                    }
                    case 'Sanitario': {
                      const y = this.Sanitario.findIndex(x => x.id == allegato.id);
                      LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                      this.Sanitario[y].nota.listFile.splice(index, 1);
                      LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.Sanitario);
                      this.Sanitario = [...this.Sanitario];
                      break;
                    }

                    default:
                      break;
                  }
                },
              )


          }

        })
      }
    })
  }

  // funzione chiamata all'eliminazione di uno o piu elementi della tabella
  ConfirmText(description: string) {

    let str: string;
    let str2 = 'Elimina i record selezionati';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun elemento selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare il record selezionato?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' record?';
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
        LoggingService.log('array di scadenze da eliminare', LogLevel.debug, [description, this.checked])
        // elimino gli elementi a seconda della tabella in cui siamo

        this.personaleservice.deleteScadenzePersonale(this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res);
              switch (description) {
                case 'Amministrazione': {
                  for (const element of this.checked) {
                    this.Amministrazione.splice(
                      this.Amministrazione.indexOf(
                        this.Amministrazione.find(x => x.id == element)
                      ),
                      1
                    )
                  }
                  this.Amministrazione = [...this.Amministrazione];
                  break;
                }
                case 'HSE': {
                  for (const element of this.checked) {
                    this.HSE.splice(
                      this.HSE.indexOf(
                        this.HSE.find(x => x.id == element)
                      ),
                      1
                    )
                  }
                  this.HSE = [...this.HSE];
                  break;
                }
                case 'Patenti': {
                  for (const element of this.checked) {
                    this.Patenti.splice(
                      this.Patenti.indexOf(
                        this.Patenti.find(x => x.id == element)
                      ),
                      1
                    )
                  }
                  this.Patenti = [...this.Patenti];
                  break;
                }
                case 'Corsi di formazione': {
                  for (const element of this.checked) {
                    this.CorsiDiFormazione.splice(
                      this.CorsiDiFormazione.indexOf(
                        this.CorsiDiFormazione.find(x => x.id == element)
                      ),
                      1
                    )
                  }
                  this.CorsiDiFormazione = [...this.CorsiDiFormazione];
                  break;
                }
                case 'Sanitario': {
                  for (const element of this.checked) {
                    this.Sanitario.splice(
                      this.Sanitario.indexOf(
                        this.Sanitario.find(x => x.id == element)
                      ),
                      1
                    )
                  }
                  this.Sanitario = [...this.Sanitario];
                  break;
                }

                default:
                  break;
              }
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'Gli elementi selezionati sono stati cancellati.La pagina verrà ricaricata',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              }).then(() => {
                location.reload();
              })
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'Gli elementi selezionati NON sono stati cancellati',
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
  // funzione utilizzata dal datepicker
  cambia(event: NgbDate, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));

    switch (binding) {
      case 'dataeffettuazione': {
        this.nuovorecord.performingDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di effettuazione selezionata è', LogLevel.debug, event);
        break;
      }
      case 'datascadenza': {
        this.nuovorecord.nota.nota.dueDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la data di scadenza selezionata è', LogLevel.debug, event);
        break;
      }

      default: {
        LoggingService.log('problemino col datepicker', LogLevel.debug, event);
        // statements;
        break;
      }
    }
  }
  // metodo chiamato quando viene aggiunto un file alla creazione di una nuova nota
  addFileToNota(event) {
    LoggingService.log('file caricato', LogLevel.debug, event);
    const files = event.target.files;
    LoggingService.log('filexxx', LogLevel.debug, files);
    // this.formData.append("formFiles", files);



    if (files) {
      // this.formData = new FormData();
      for (const file of files) {
        this.fileName = this.fileName.concat(file.name) + '; ';
        this.formData.append('formFiles', file);
      }
      LoggingService.log('formdata', LogLevel.debug, this.formData.getAll('formFiles'));
    }

  }
  // funzione chiamata al download di uno degli allegati di una scadenza
  downloadAttachment(file: _File) {
    this.personaleservice.downloadAttachment(file);
  }

  deleteAttachmentNote() {
     // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
     (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }
  // funzione chiamata ogni volta che si cambia tabella. Carica i dati corretti a seconda della tabella(es amministrazione, hse,..)
  rowSelector() {
    LoggingService.log('titolo è', LogLevel.debug, this.titolo);
    switch (this.titolo) {
      case 'Amministrazione': {
        this.rows = this.Amministrazione;
        this.tempData = this.Amministrazione;
        break;
      }
      case 'HSE': {
        this.rows = this.HSE;
        this.tempData = this.HSE;
        break;
      }
      case 'Patenti': {
        this.rows = this.Patenti;
        this.tempData = this.Patenti;
        break;
      }
      case 'Corsi di formazione': {
        this.rows = this.CorsiDiFormazione;
        this.tempData = this.CorsiDiFormazione;
        break;
      }
      case 'Sanitario': {
        this.rows = this.Sanitario;
        this.tempData = this.Sanitario;
        break;
      }
      default:
        break;
    }
  }
}
