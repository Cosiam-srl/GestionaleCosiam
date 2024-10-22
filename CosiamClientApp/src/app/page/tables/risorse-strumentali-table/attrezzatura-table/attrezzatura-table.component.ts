import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ColumnMode, SelectionType} from '@swimlane/ngx-datatable';
import {Attrezzatura} from 'app/models/attrezzatura.model';
import {_File} from 'app/models/file.model';
import {AttrezzaturaService} from 'app/shared/services/data/attrezzatura.service';
import {FileService} from 'app/shared/services/data/file.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import {NgxSpinnerService} from 'ngx-spinner';
import swal from 'sweetalert2';
import {PdfService} from '../../../../shared/services/pdf.service';

@Component({
  selector: 'app-attrezzatura-table',
  templateUrl: './attrezzatura-table.component.html',
  styleUrls: ['./attrezzatura-table.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AttrezzaturaTableComponent implements OnInit {
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
  attrezzatura: Attrezzatura[];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un'attrezzatura da aggiungere
  nuovaAttrezzatura = new Attrezzatura();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile utilizzata per la validazione del form
  fff = false;

  limit: number = 25;

  // variabili usata quando viene aggiunto un file alla creazione di una attrezzatura
  fileName = '';
  formData = new FormData();
  // array utilizzato nel form di creazione di un'attrezzo
  conformita = [
    {name: 'No'},
    {name: 'Targhetta conformità CE'},
    {name: 'Dichiarazione conformità CE'},
    {name: 'Certificazione'},
    {name: 'Attestazione idoneità'}
  ];

  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private _fileservice: FileService, private spinner: NgxSpinnerService, private modalService: NgbModal, private router: Router, private attrezzaturaservice: AttrezzaturaService,) {

  }

  ngOnInit(): void {
    this.attrezzaturaservice.getAllAttrezzatura()
      .subscribe(
        (res) => {
          LoggingService.log('ottenute tutte le attrezzature', LogLevel.debug, res);
          this.attrezzatura = res;
          this.tempData = res;
        },
        (err) => {
          LoggingService.log('ottenute tutte le attrezzature', LogLevel.error, err);
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-attrezzatura');
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

      return d.type.toLowerCase().indexOf(val) !== -1 || d.description.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.attrezzatura = temp;

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
  goToDashboard(target: Attrezzatura) {
    LoggingService.log('richiesta dashboard per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/attrezzature/', target.id]);
  }

  // funzione chiamata per modificare un'attrezzatura
  onEdit(target: Attrezzatura, modale) {
    // attivo lo spinner
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    this.attrezzaturaservice.getAttrezzo(target.id)
      .subscribe(
        (res) => {
          LoggingService.log('scaricato attrezzo', LogLevel.debug, res);
          this.nuovaAttrezzatura = res;
          this.spinner.hide();
          LoggingService.log('nuovaATTREZZATURA è', LogLevel.debug, this.nuovaAttrezzatura);
        },
        (err) => {
          LoggingService.log('ERRORE scaricamento attrezzo', LogLevel.error, err);
          this.spinner.hide();

        },
        () => {
          // apro il popup
          this.openLg(modale);
        },
      )
  }

  // chiamata quando si clicca su una riga della tabella. Apre la visualizzazione dell'attrezzatura
  viewAttrezzatura(event, modale) {
    if (event.type == 'click' && event.column.name != 'Azioni') {
      LoggingService.log('modale', LogLevel.debug, event);
      this.spinner.show(undefined,
        {
          type: 'ball-fall',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
          color: '#1898d6', // colore icona che si muove
          fullScreen: true
        });
      this.attrezzaturaservice.getAttrezzo(event.row.id)
        .subscribe(
          (res) => {
            LoggingService.log('scaricato attrezzo', LogLevel.debug, res);
            this.nuovaAttrezzatura = res;

            this.spinner.hide();
          },
          (err) => {
            LoggingService.log('ERRORE scaricamento attrezzo', LogLevel.error, err);
            this.spinner.hide();

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

  updateAttrezzatura() {
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('Update attrezzatura', LogLevel.debug, this.nuovaAttrezzatura);

    this.attrezzaturaservice.updateAttrezzo(this.nuovaAttrezzatura)
      .subscribe(
        (res) => {
          // la res è solo uno status code, niente di piu

          LoggingService.log('ok update andato', LogLevel.debug, res);
          this.spinner.hide();
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'L\'attrezzatura è stata modificata',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          LoggingService.log('prima dello splice', LogLevel.debug, {...this.attrezzatura});
          LoggingService.log('index of prima', LogLevel.debug, this.attrezzatura.indexOf(
            this.attrezzatura.find(x => x.id === this.nuovaAttrezzatura.id)
          ));

          // pos contiene la posizione della nota da modificare
          const pos = this.attrezzatura.indexOf(this.attrezzatura.find(x => x.id == this.nuovaAttrezzatura.id));
          // sovrascrivo l'oggetto in posizione pos con la nuovaTsggedNota
          this.attrezzatura[pos] = this.nuovaAttrezzatura;
          LoggingService.log('attrezzatura dopo l\'update è diventata', LogLevel.debug, this.attrezzatura);
          // aggiorno tempdata per il filtro di ricerca
          this.tempData = this.attrezzatura;
          // ricarico la tabella
          this.attrezzatura = [...this.attrezzatura];

          // se ho anche aggiunto un allegato lo posto, ma non ho bisogno di aggiornare la tabella
          if (this.formData.getAll('formFiles').length > 0) {
            this.attrezzaturaservice.postAttachments(this.nuovaAttrezzatura.id, this.formData)
              .subscribe(
                (res: _File[]) => {
                  LoggingService.log('allegati attrezzatura aggiornati', LogLevel.debug, res);

                },
                (err) => {
                  LoggingService.log('ERRORE update allegati attrezzatura ', LogLevel.error, err);
                },
                () => {
                  this.clearData();
                }
              )
          }

        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\attrezzatura NON è stata modificata',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          // this.clearData();
        }
      );
  }

  // metodo chiamato quando viene aggiunto un file alla creazione di una nuova attrezzatura
  addFileToAttrezzatura(event) {
    LoggingService.log('file caricato', LogLevel.debug, event);
    const files = event.target.files;
    LoggingService.log('filexxx', LogLevel.debug, files);
    // this.formData.append("formFiles", files);
    LoggingService.log('formdata', LogLevel.debug, this.formData.getAll('formFiles'));

    if (files) {
      // this.formData = new FormData();
      for (const file of files) {
        this.fileName = this.fileName.concat(file.name) + '; ';
        this.formData.append('formFiles', file);
      }
    }

  }

  // funzione chiamata al download di uno degli allegati di una scadenza
  downloadAttachment(file: _File) {
    console.log(file);
    this.attrezzaturaservice.downloadAttachment(file);
  }

  deleteAttachmentNote() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }

  // funzione chiamata quando si vuole eliminare un allegato da un record di tabella
  deleteAttachment(allegato: Attrezzatura, index: number) {
    LoggingService.log('allegato da eliminare', LogLevel.debug, [allegato, index])
    const id = [];
    id.push(allegato.listFile[index].id);

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
            this._fileservice.deleteFiles(id)
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
                  // tolgo il file solo alla vista, tanto quando si riaprirà il popup scaricherò i dati sempre corretti
                  this.nuovaAttrezzatura.listFile.splice(index, 1);

                },
              )
          }
        })
      }
    })
  }

  deleteAttrezzo(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina L\'attrezzatura selezionata';
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
            this.attrezzaturaservice.deleteAttrezzo(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('attrezzo eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'L\'attrezzatura selezionata è stata cancellata',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione attrezzatura', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'L\'attrezzatura selezionata NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.attrezzatura.splice(
                    this.attrezzatura.indexOf(
                      this.attrezzatura.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.attrezzatura = [...this.attrezzatura];
                  this.tempData = this.attrezzatura;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  clearData() {
    this.nuovaAttrezzatura = new Attrezzatura();
    this.nuovaAttrezzatura.listFile = [];
    this.formData = new FormData();
    this.fileName = ''
    this.fff = false;
  }

  creaAttrezzatura() {
    LoggingService.log('la nuova attrezzatura è', LogLevel.debug, this.nuovaAttrezzatura);
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.attrezzaturaservice.postAttrezzo(this.nuovaAttrezzatura)
      .subscribe(
        (res) => {
          LoggingService.log('nuova attrezzatura postata con successo', LogLevel.debug, res);
          this.nuovaAttrezzatura.id = res.id;

          if (this.formData.getAll('formFiles').length > 0) {
            this.postaAllegati();
            // refresho la tabella dentro la funzione postaAllegati
          } else {

            this.attrezzatura.unshift(this.nuovaAttrezzatura);
            this.attrezzatura = [...this.attrezzatura];
            this.clearData();
            this.tempData = this.attrezzatura;
            this.spinner.hide();

            swal.fire({
              title: 'Attrezzatura Creata!',
              text: 'L\'attrezzo è stato aggiunto nella tabella',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'

              },
              buttonsStyling: false,
              confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
            });

          }
        },
        (err) => {
          LoggingService.log('ERRORE post nuova attrezzatura', LogLevel.debug, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\'attrezzo NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {

        }
      )

  }

  postaAllegati() {
    this.attrezzaturaservice.postAttachments(this.nuovaAttrezzatura.id, this.formData)
      .subscribe(
        (res) => {
          LoggingService.log('risposta post file allegato attrezzatura', LogLevel.debug, res);
          this.nuovaAttrezzatura.listFile = []; // lo faccio per evitare che sia undefined
          res.forEach(element => {
            this.nuovaAttrezzatura.listFile.push(element)
          })

          this.attrezzatura.unshift(this.nuovaAttrezzatura);
          this.attrezzatura = [...this.attrezzatura];
          this.clearData();
          this.tempData = this.attrezzatura;
          this.spinner.hide();

          swal.fire({
            title: 'Attrezzatura Creata!',
            text: 'L\'attrezzo è stato aggiunto nella tabella, compreso di allegato/i',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {

          this.attrezzatura.unshift(this.nuovaAttrezzatura);
          this.attrezzatura = [...this.attrezzatura];
          this.clearData();
          this.tempData = this.attrezzatura;
          this.spinner.hide();
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
          this.spinner.hide();

          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il record è stato aggiunto ma NON è stato possibile aggiungere il/gli allegati',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.formData = new FormData();
          this.fileName = '';
        },
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
    if (this.attrezzatura.length > this.limit) {

      let l = this.limit
      this.limit = this.attrezzatura.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-attrezzatura', `attrezzatura`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-attrezzatura', `attrezzatura`, null, this._spinner)
    }

  }

}

