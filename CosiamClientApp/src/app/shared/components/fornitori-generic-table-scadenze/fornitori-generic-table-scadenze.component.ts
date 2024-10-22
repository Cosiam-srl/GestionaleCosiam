import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { _File } from 'app/models/file.model';
import { Note } from 'app/models/note.model';
import { ScadenzeFornitore } from 'app/models/supplier.model';
import { TaggedNota } from 'app/models/taggednota.model';
import { SupplierService } from 'app/shared/services/data/supplier.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

@Component({
  selector: 'app-fornitori-generic-table-scadenze',
  templateUrl: './fornitori-generic-table-scadenze.component.html',
  styleUrls: ['./fornitori-generic-table-scadenze.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FornitoriGenericTableScadenzeComponent implements OnInit {
  // variabile che contiene il titolo che avrà la tabella
  @Input() titolo: string;
  @Input() idFornitore: number;
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
  nuovorecord = new ScadenzeFornitore();
  // variabili usata quando viene aggiunto un file alla creazione di una nota
  fileName = '';
  formData = new FormData();
  // variabile usata per decidere se mostrare le scadenze chiuse oppure no
  showClosed = false;
  // variabili usate per riordinare. Di default ordino usando la data di scadenza
  sortCol = 'nota.nota.dueDate';
  sortDir = 'asc';

  scadenzeFornitori: ScadenzeFornitore[] = [];

  constructor(private spinner: NgxSpinnerService, private modalService: NgbModal, private _fornitoriservice: SupplierService) {
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
    LoggingService.log('id fornitore è', LogLevel.debug, this.idFornitore);
    if (this.idFornitore) {
      this._fornitoriservice.getScadenzeFornitore(this.idFornitore)
        .subscribe(
          (res: ScadenzeFornitore[]) => {
            LoggingService.log('Scadenze ottenute', LogLevel.debug, res);
            res.forEach(element => {
              this.scadenzeFornitori.push(element);
            });
          },
          (err) => {
            LoggingService.log('ERRORE get Scadenze', LogLevel.error, err);
          },
          () => {
            this.scadenzeFornitori = [...this.scadenzeFornitori];
            this.rows = this.scadenzeFornitori;
            this.tempData = this.scadenzeFornitori
          },
        )
    }
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro scadenze fornitore', LogLevel.debug, this.tempData)
    const temp = this.tempData.filter(function (d) {
      return d.nota.nota.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.rows = temp;
  }
  // metodo utilizzato dal tasto "aggiungi scadenza" per aprire un popup
  openLg(content) {
    this.modalService.open(content, { size: 'xl' });
  }
  // chiamata alla modifica di una scadenza
  modifyRecord(event: ScadenzeFornitore, content) {
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

    this.scadenzeFornitori = [];

    this._fornitoriservice.getScadenzeFornitoreFiltered(this.idFornitore, this.showClosed, null, null)
      .subscribe(
        (res: ScadenzeFornitore[]) => {
          LoggingService.log('Scadenze ottenute dopo aver cliccato la checkbox ', LogLevel.debug, res);
          res.forEach(element => {
            this.scadenzeFornitori.unshift(element);
            this.spinner.hide();
          });
        },
        (err) => {
          LoggingService.log('ERRORE get Scandenze', LogLevel.error, err);
          this.spinner.hide();
        },
        () => {

          this.scadenzeFornitori = [...this.scadenzeFornitori];
          this.rows = this.scadenzeFornitori;
          this.tempData = this.scadenzeFornitori;
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
  updateStatoScandenza(event: ScadenzeFornitore) {
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('cambia stato scadenza', LogLevel.debug, event);
    this._fornitoriservice.changeScadenzaStatus(event.id, event.nota.nota.state)
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
    this.nuovorecord.idFornitori = this.idFornitore;
    this._fornitoriservice.postScadenzaFornitore(this.nuovorecord)
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
    this._fornitoriservice.postAttachmentScadenza(this.nuovorecord.id, this.formData)
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
    this._fornitoriservice.updateScadenza(this.nuovorecord.id, {
      id: this.nuovorecord.id,
      performingDate: this.nuovorecord.performingDate,
      idFornitori: this.nuovorecord.idFornitori,
      idNote: this.nuovorecord.idNote,
      nota
    })
      .subscribe(
        (res) => {

          // res ritorna solo uno status code
          LoggingService.log('update scadenza avvenuto con successo', LogLevel.debug, res);
          if (this.formData.getAll('formFiles').length > 0) {
            this._fornitoriservice.postAttachmentScadenza(this.nuovorecord.id, this.formData)
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
  // chiamata alla chiusura del popup di modifica di una scadenza
  clearData() {
    this.nuovorecord = new ScadenzeFornitore();
    this.nuovorecord.nota = new TaggedNota();
    this.nuovorecord.nota.nota = new Note();
  }
  // funzione chiamata in automatico quando si posta una nuova scadenza
  refreshtable(res: ScadenzeFornitore) {
    this.scadenzeFornitori.unshift(this.nuovorecord);
    this.scadenzeFornitori = [...this.scadenzeFornitori];
    this.spinner.hide();

    swal.fire({
      icon: 'success',
      title: 'Fatto!',
      text: 'Il record è stato aggiunto!',
      customClass: {
        confirmButton: 'btn btn-success'
      },
    });

    this.nuovorecord = new ScadenzeFornitore();
    this.nuovorecord.nota = new TaggedNota();
    this.nuovorecord.nota.nota = new Note();
    this.rows = this.scadenzeFornitori;
    this.tempData = this.scadenzeFornitori;
  }

  // funzione chiamata quando si vuole eliminare un allegato da un record di tabella
  deleteAttachment(allegato: ScadenzeFornitore, index: number) {
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
            this._fornitoriservice.deleteAttachmentScadenza(id)
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

                  const y = this.scadenzeFornitori.findIndex(x => x.id == allegato.id);
                  LoggingService.log('l\'elemento è all\'indice', LogLevel.warn, y);
                  this.scadenzeFornitori[y].nota.listFile.splice(index, 1);
                  LoggingService.log('l\'elemento è stato eliminato', LogLevel.warn, this.scadenzeFornitori);
                  this.scadenzeFornitori = [...this.scadenzeFornitori];

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

        this._fornitoriservice.deleteScadenzeFornitore(this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res);
              for (const element of this.checked) {
                this.scadenzeFornitori.splice(
                  this.scadenzeFornitori.indexOf(
                    this.scadenzeFornitori.find(x => x.id == element)
                  ),
                  1
                )
              }
              this.scadenzeFornitori = [...this.scadenzeFornitori];

              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'Gli elementi selezionati sono stati cancellati. La pagina verrà ricaricata.',
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
    }

    LoggingService.log('formdataAAAAAAAAAAAAA', LogLevel.debug, this.formData.getAll('formFiles'));
    LoggingService.log('numero totale di allegati aggiunti', LogLevel.debug, this.formData.getAll('formFiles').length);
  }
  // funzione chiamata al download di uno degli allegati di una scadenza
  downloadAttachment(file: _File) {
    this._fornitoriservice.downloadAttachment(file);
  }

  deleteAttachmentNote() {
     // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
     (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }

}
