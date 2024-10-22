import { registerLocaleData } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Note } from 'app/models/note.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import localeIt from '@angular/common/locales/it';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Personale } from 'app/models/personale.model';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { TaggedNota } from 'app/models/taggednota.model';
import { NoteService } from 'app/shared/services/data/note.service';
import * as alertFunctions from 'app/shared/animations/sweet-alerts/sweet-alerts'
import swal from 'sweetalert2';
import { AuthService } from 'app/shared/auth/auth.service';
import { _File } from 'app/models/file.model';
import { FileService } from 'app/shared/services/data/file.service';


@Component({
  selector: 'app-note-di-cantiere',
  templateUrl: './note-di-cantiere.component.html',
  styleUrls: ['./note-di-cantiere.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,


})
export class NoteDiCantiereComponent implements OnInit {
  ;

  note: TaggedNota[] = [];
  columnMode = ColumnMode;
  nuovanota: Note = new Note();

  nuovaTaggedNota: TaggedNota = new TaggedNota();

  @Input() targetCantiereId: number;
  // variabili per il filtro
  private tempData: TaggedNota[] = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;
  // variabile utilizzata per la creazione di una nota
  size: number;

  destinatari: any[] = [];



  // array per note di cantiere. Dovrà contenere tutto il personale che sarà usato come destinatario della nota
  // è possibile modificare a piacimento gli attributi di ogni elemento dell'array(non necessariamente id e name ad esempio)

  personaleget: Personale[] = []

  // array che contiene gli id delle note selezionate usando le checkbox
  checked: number[] = [];

  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile usata per il filtro dello stato
  filtroStato = '';


  // variabile utilizzata per la risposta ad una nota
  notavisualizzata;
  // file allegato nota visualizzata
  fileAttachment = [];
  // risposte scaricate per una nota
  risposteNota: Note[] = [];
  // variabili usata quando viene aggiunto un file alla creazione di una nota
  fileName = '';
  formData = new FormData();

  // variabile utilizzata per la funzione mostra tot utenti nella tabella
  public limitRef = 5;


  /**
   *
   * @param service
   * @param router servizio di routing iniettato da Angular
   */
  constructor(private _fileservice: FileService, private service: CantieriService, private router: Router, private modalService: NgbModal, private servicepersonale: PersonaleService, public noteservice: NoteService, private login: AuthService) {
    // this.tempData = this.note;
  }

  ngOnInit(): void {
    LoggingService.log('id del cantiere nelle note', LogLevel.debug, this.targetCantiereId);
    this.service.getNoteDiCantiere(this.targetCantiereId)
      .subscribe(
        (res) => { this.note = res, this.tempData = res; },
        (err) => {
          LoggingService.log('errore nel recupero dei cantieri', LogLevel.warn, err)
        },
        () => { LoggingService.log('note di cantiere estratte, tempdata', LogLevel.debug, [this.note, this.tempData]) }
      );
    registerLocaleData(localeIt, 'it');

    // ghetto la lista del personale che servirà per essere tagagto nelle note
    this.servicepersonale.getAllPersonale()
      .subscribe(
        (res) => { this.personaleget = res },
        (err) => {
          LoggingService.log('errore nel get del personale', LogLevel.warn, err);
        },
        () => {
          // popolo per ogni persona il campo fullname
          this.personaleget.forEach(i => {
            i.fullName = i.name + ' ' + i.surname;
          });
          LoggingService.log('personale ottenuto', LogLevel.debug, this.personaleget);
        }
      )

  }

  // filtro di testo
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('il filtro è', LogLevel.debug, val);

    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.nota.name.toLowerCase().indexOf(val) !== -1 || d.nota.description.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.note = temp;

  }
  // funzione chiamata alla selezione del livello o dello stato usando le tendine nella user dashboard
  filtro() {
    const sts = this.filtroStato;
    LoggingService.log('stato è', LogLevel.debug, sts);

    const temp = this.tempData.filter(function (d) {

      return d.nota.state.indexOf(sts) !== -1 || !sts;
    });

    // update the rows
    this.note = temp;
  }
  // chiamata quando si vuole modificare una nota
  onEdit(target: TaggedNota, modale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);

    // this.nuovanota = { ...target.nota };
    this.noteservice.getNota(target.nota.id)
      .subscribe(
        (res) => {
          console.log('Nota da modificare scaricata', res);
          this.nuovanota = res;
          if (this.nuovanota.dueDate) {
            const str = this.nuovanota.dueDate;
            this.nuovanota.dueDate = new Date(str);
          }
        },
        (err) => {
          console.error('ERRORE get Nota da modificare', err);
        },
        () => { }
      )
    // if (target.nota.dueDate) {
    //   var str = target.nota.dueDate;
    //   this.nuovanota.dueDate = new Date(str);
    //   LoggingService.log("data", LogLevel.debug, this.nuovanota.dueDate);
    // }
    // apro il popup
    this.openLg(modale);

    this.destinatari = target.personaleTagged.map(x => x.id);
    // LoggingService.log("data modificata", LogLevel.debug, str);
  }

  updateNota() {
    LoggingService.log('formdata nell\'update è', LogLevel.debug, this.formData.getAll('formFiles'));
    this.nuovaTaggedNota.nota = this.nuovanota;
    // aggiungo il personale nella nuovaTaggednota
    for (let i = 0; i < this.destinatari.length; i++) {
      this.nuovaTaggedNota.personaleTagged[i] = this.personaleget.find(x => x.id === this.destinatari[i])
      LoggingService.log('persona', LogLevel.debug, this.nuovaTaggedNota.personaleTagged[i]);
    }
    LoggingService.log('sto per fare l\'upload di questa nota', LogLevel.debug, this.nuovaTaggedNota);

    this.service.updateNotaDiCantiere(this.targetCantiereId, this.nuovaTaggedNota)
      .subscribe(
        (res) => {
          this.nuovaTaggedNota = res;
          LoggingService.log('ok update andato', LogLevel.debug, res);
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'La nota è stata modificata',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          LoggingService.log('prima dello splice', LogLevel.debug, { ...this.note });
          LoggingService.log('index of prima', LogLevel.debug, this.note.indexOf(
            this.note.find(x => x.nota.id === this.nuovaTaggedNota.nota.id)
          ));

          // pos contiene la posizione della nota da modificare
          const pos = this.note.indexOf(this.note.find(x => x.nota.id == this.nuovaTaggedNota.nota.id));
          // sovrascrivo l'oggetto in posizione pos con la nuovaTsggedNota
          this.note[pos] = this.nuovaTaggedNota;
          LoggingService.log('note dopo l\'update è diventata', LogLevel.debug, this.note);
          // aggiorno tempdata per il filtro di ricerca
          this.tempData = this.note;
          // ricarico la tabella
          this.note = [...this.note];
          // se la nota contiene un file allegato, posto anche il file


        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'La nota NON è stata modificata',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.post();
        }
      );
  }
  // chiamata dopo l'update di una nota
  post() {

    LoggingService.log('Sono entrato in post e formdata è', LogLevel.debug, this.formData.getAll('formFiles'));
    // se non ci sono file allegati ho finito
    if (this.formData.getAll('formFiles').length <= 0) {
      this.clearData();
      return;
    }
    this.noteservice.postAttachmentsToNote(this.nuovanota.id, this.formData)
      .subscribe(
        (res) => {

          LoggingService.log('risposta post file allegato nota', LogLevel.debug, res);
        },
        (err) => {
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);

        },
        () => {
          this.formData = new FormData();
          this.fileName = '';
          this.clearData();
        },
      )
  }


  // metodo utilizzato dal tasto "crea nota" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });

  }


  // usa il placeholder per identificare in quale box è stato scritto del testo
  addDatiNota(event) {
    const target = event.target.value;
    const placeholder = event.target.attributes.placeholder.nodeValue;
    // LoggingService.log('dato nota inserito', LogLevel.debug,event);
    if (placeholder.toLowerCase() == 'nome') {
      this.nuovanota.name = target;
    }
    if (placeholder.toLowerCase() == 'descrizione') {
      this.nuovanota.description = target;
      // LoggingService.log('nuovanota', LogLevel.debug,this.nuovanota);
    }

    // questo if si utilizza quando l'utente scrive la data a mano senza usare il datepicker
    if (placeholder.toLowerCase() == 'scadenza') {
      LoggingService.log('data scritta a mano', LogLevel.debug, target)

      const data = new Date();
      data.setFullYear(target.substring(6, 10), target.substring(3, 5) - 1, target.substring(0, 2));
      this.nuovanota.dueDate = data;
    }

  }


  getData(event: NgbDate) {
    const data = new Date();
    data.setFullYear(event.year, event.month - 1, event.day);
    this.nuovanota.dueDate = data;
    LoggingService.log('data aggiunta', LogLevel.debug, this.nuovanota.dueDate)

  }
  // funzione chiamata al click del tasto Crea Nota
  creaNota() {
    if (this.nuovanota.id != null) {
      delete this.nuovanota.id
    }
    // estrapolo l'autore della nota dall'utente loggato
    this.nuovanota.author = this.login.whoAmI().username;

    LoggingService.log('La nuova nota è', LogLevel.debug, this.nuovanota)
    LoggingService.log('i destinatari sono', LogLevel.debug, this.destinatari)
    this.nuovanota.creationDate = new Date(Date.now());
    // if (this.nuovanota.state = null) {
    //   this.nuovanota.state = "Nuova"
    // }

    this.service.postNotaDiCantiere(this.targetCantiereId, this.nuovanota)
      .subscribe(
        (res) => {

          this.nuovanota.id = res;
          this.nuovaTaggedNota.nota = this.nuovanota;
          LoggingService.log('la taggednota è', LogLevel.debug, this.nuovaTaggedNota);
          // mostro il popup
          this.TypeSuccess();
          // this.addResponsabile(this.nuovanota.id);
          this.noteservice.postResponsiblesToNote(this.nuovanota.id, this.destinatari)
            .subscribe(
              (res) => {
                if (!res.ok) {
                  return;
                }

                // aggiungo il personale alla nuovataggednota
                for (let i = 0; i < this.destinatari.length; i++) {
                  this.nuovaTaggedNota.personaleTagged[i] = this.personaleget.find(x => x.id === this.destinatari[i])
                  LoggingService.log('persona', LogLevel.debug, this.nuovaTaggedNota.personaleTagged[i]);
                }
                this.note.unshift({ ...this.nuovaTaggedNota });
                // aggiorno l'array tempdata usato per il filtro di ricerca
                // this.tempData.unshift({ ...this.nuovaTaggedNota });
                this.tempData = this.note;
                // ricarico la tabella
                this.note = [...this.note];
                this.destinatari = [];

              },
              (err) => {
                LoggingService.log('errore nel post dei destinatari della nota', LogLevel.warn, err)
              },
              () => {
                LoggingService.log('risposta post destinatari nota avvenuta con successo', LogLevel.debug,);
                this.nuovanota = new Note();
                this.nuovaTaggedNota = new TaggedNota();
                this.formData = new FormData();
                delete this.fileName;
              }
            );

          LoggingService.log('risposta post destinatari', LogLevel.debug, this.nuovanota.id);
          // se la nota contiene un file allegato, posto anche il file
          if (this.formData.getAll('formFiles')) {
            LoggingService.log('Sono entrato e formdata è', LogLevel.debug, this.formData.getAll('formFiles'));
            this.noteservice.postAttachmentsToNote(this.nuovanota.id, this.formData)
              .subscribe(
                (res) => {
                  LoggingService.log('risposta post file allegato nota', LogLevel.debug, res);
                },
                (err) => {
                  LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
                },
                () => {
                  this.formData = new FormData();
                  this.fileName = '';
                },
              )
          }
        },
        (err) => {
          LoggingService.log('errore nel post della nota', LogLevel.warn, err)
        },
        () => { }
      )
  }
  // funzione utilizzata dai datepicker nella creazione della nota
  cambia(event: NgbDate, binding: string) {
    const millisec = Date.now();
    const date = new Date(millisec);

    LoggingService.log('cambia è', LogLevel.debug, event);
    switch (binding) {
      case 'dataScadenza': {
        // setto la data, inserendo anche l'orario
        this.nuovanota.dueDate = new Date(event.year, event.month, event.day, Number.parseInt(date.toTimeString().substring(0, 2)), Number.parseInt(date.toTimeString().substring(3, 5)), Number.parseInt(date.toTimeString().substring(6, 8)));
        LoggingService.log('la data di scadenza della nuova nota è', LogLevel.debug, this.nuovanota.dueDate);
        break;
      }
      default: {
        LoggingService.log('Problemino col datepicker', LogLevel.debug);
        break;
      }
    }

  }

  stato() {
    LoggingService.log('lo stato è: ', LogLevel.debug, this.nuovanota.state)
  }
  priorita() {
    LoggingService.log('la priorita selezionata è: ', LogLevel.debug, this.nuovanota.priority)
  }
  // metodo per controllare lo stato delle checkbox(true o false)
  onChange(nota_id: number, event: any) {
    // personale.nome equivale all'identificatore(l'elemento che identifica in modo univoco quel record della tabella)
    LoggingService.log('box selezionato note', LogLevel.debug, [nota_id, event.target.checked]);

    // se ho selezionato l'elemento lo inserisco nell'array checked
    if (event.target.checked) {
      this.checked.push(nota_id);
    } else {
      // altrimenti lo tolgo dall'array checked
      this.checked.splice(this.checked.indexOf(nota_id), 1);
    }

    LoggingService.log('array di checkbox note', LogLevel.debug, this.checked);
  }
  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  clearData() {
    this.nuovanota = new Note();
    this.nuovaTaggedNota = new TaggedNota();
    this.formData = new FormData();
    this.destinatari = [];
    this.fileName = '';
    this.fileAttachment = [];
    // delete this.formData;
  }
  // cancella la data selezionata dal datepicker
  clearDate() {
    this.nuovanota.dueDate = null;
  }

  /**
   * Utilizzata per visualizzare una nota. Chiamata al click della riga della tabella
   * @param event 
   * @param modale 
   */
  viewNota(event, modale) {
    if (event.type == 'click' && event.column.name != 'Azioni' && event.column.name != '') {
      LoggingService.log('modale', LogLevel.debug, event);

      this.noteservice.getNota(event.row.nota.id)
        .subscribe(
          (res) => {
            console.log('Nota da visualizzare scaricata', res);
            this.nuovanota = res;
            if (this.nuovanota.dueDate) {
              const str = this.nuovanota.dueDate
              this.nuovanota.dueDate = new Date(str);
            }
          },
          (err) => {
            console.error('ERRORE get Nota da visualizzare', err);
          },
          () => { }
        )
      // scarico la lista degli allegati
      this.noteservice.getAttachmentsNota(event.row.nota.id)
        .subscribe(
          (res) => {
            console.log('allegati della nota da visualizzare scaricati', res);
            this.fileAttachment = res;

          },
          (err) => {
            console.error('ERRORE get allegati della nota da visualizzare');
          },
          () => { },
        )


      LoggingService.log('personaleget è', LogLevel.debug, event.row.personaleTagged);
      this.destinatari = event.row.personaleTagged.map(x => x.id);

      // da qui in poi gestisco le risposte
      this.notavisualizzata = event;
      LoggingService.log('notavisual è', LogLevel.debug, this.notavisualizzata);
      this.risposteNota = [];
      // scarico le risposte alla nota
      this.noteservice.getReplyNota(event.row.nota.id)
        .subscribe(
          (res) => {
            this.risposteNota = res;
            this.risposteNota.reverse();
            LoggingService.log('risposte scaricate', LogLevel.debug, res);

          },
          (err) => {
            LoggingService.log('risposte NON SCARICATE', LogLevel.debug, err);

          },
          () => { }
        )
      // apro il popup
      this.modalService.open(modale, {
        size: 'xl', backdrop: 'static',
        scrollable: true,
        keyboard: false
      });
    }

  }

  downloadAttachment(file: _File) {
    this.servicepersonale.downloadAttachment(file);
  }
  replyNota() {
    // estrapolo l'autore della nota dall'utente loggato
    this.nuovanota.author = this.login.whoAmI().username;
    this.noteservice.postReplyNota(this.notavisualizzata.row.nota.id, this.nuovanota)
      .subscribe(
        (res) => {
          LoggingService.log('risposta andata', LogLevel.debug, res);
          swal.fire({
            title: 'Risposta creata!',
            text: 'La risposta è stata aggiunta',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });

        },
        (err) => {
          LoggingService.log('risposta NON ANDATA', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'La risposta NON è stata inviata',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => { }
      )
  }
  // chiamata quando nel popup di view di una nota si elimina un allegato
  removeAttachment(file: _File) {
    console.log(file);

    const id = [file.id];

    const str = 'Elimina l\'allegato selezionato';
    const check = true;
    const text = 'L\'azione è irreversibile';
    swal.fire({
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
                  this.fileAttachment.splice(this.fileAttachment.findIndex(x => x.id == file.id), 1);
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
                () => { },
              )
          }
        })
      }
    })
  }
  // reviewNota(event){
  //   LoggingService.log("ok", LogLevel.debug,);
  //   this.nuovanota = event.row.nota;
  //   if (this.nuovanota.dueDate) {
  //     var str = event.row.nota.dueDate;
  //     this.nuovanota.dueDate = new Date(str);
  //   }
  //   this.destinatari = event.row.personaleTagged.map(x => x.id);
  // }
  // metodo necessario per il tasto Conferma dentro crea nota(vedi dentro shared/animation/sweet-alerts)
  TypeSuccess() {
    alertFunctions.TypeSuccess();
  }


  updateLimit(limit) {
    LoggingService.log('numero righe', LogLevel.debug, limit);
    this.limitRef = limit.target.value;
  }
  deleteRisposta(id: number) {
    LoggingService.log('risposta da cancellare', LogLevel.debug, id);
    this.noteservice.deleteNote([id])
      .subscribe(
        (res) => {
          LoggingService.log('risposta  cancellata', LogLevel.debug, res);
          // logica gestione array
          for (let i = 0; i < this.risposteNota.length; i++) {
            if (this.risposteNota[i].id == res) {
              this.risposteNota.splice(i, 1);
              break;
            }
          }
          LoggingService.log('array di risposte', LogLevel.debug, this.risposteNota);
          // ricarico la tabella
          this.risposteNota = [... this.risposteNota];
        },
        (err) => {
          LoggingService.log('errore: risposta NON cancellata', LogLevel.debug, err);
        },
        () => { }
      )
  }
  // funzione chiamata alla chiusura del oppup di visualizzazione di una nota
  clearRisposte() {
    LoggingService.log('risposte pulite', LogLevel.debug, this.risposteNota);
    this.risposteNota = [];
  }
  deleteAttachmentNote() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
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
    LoggingService.log('formdata', LogLevel.debug, this.formData.getAll('formFiles'));

  }

  ConfirmText() {

    let str: string;
    let str2 = 'Elimina le note selezionate';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessuna nota selezionata';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare la nota selezionata?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' note?';
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
          this.checked[i] = this.selected[i].nota.id
        }
        LoggingService.log('array di note da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.noteservice.deleteNote(this.checked)
          .subscribe(
            (res) => {
              // logica gestione array
              for (const nota of this.checked) {
                this.note.splice(
                  this.note.indexOf(
                    this.note.find(x => x.nota.id == nota)
                  ),
                  1
                )
              }
              // ricarico la tabella
              this.note = [...this.note];
              // reinizializzo i due array legati alle checkbox
              this.checked = [];
              this.selected = [];

              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'Le note selezionate sono state cancellate',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'Le note selezionate NON sono state cancellate',
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
