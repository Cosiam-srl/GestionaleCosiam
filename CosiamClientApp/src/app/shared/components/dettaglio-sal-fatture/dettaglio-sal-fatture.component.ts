import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ListaSalFattureCantiere } from 'app/models/ListaSalFattureCantiere.model';
import { SalFatturaService } from 'app/shared/services/data/salfattura.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { _File } from 'app/models/file.model';
import { FileService } from 'app/shared/services/data/file.service';

@Component({
  selector: 'app-dettaglio-sal-fatture',
  templateUrl: './dettaglio-sal-fatture.component.html',
  styleUrls: ['./dettaglio-sal-fatture.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DettaglioSalFattureComponent implements OnInit {

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


  // array che contiene gli id delle note selezionate usando le checkbox
  checked: number[] = [];

  // array che contiene le fatture relative a questo cantiere
  salFattureCantiere: ListaSalFattureCantiere[];
  nuovafattura: ListaSalFattureCantiere = new ListaSalFattureCantiere();


  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabile utilizzata per la validazione del form
  fff = true;
  // variabili usate quando viene aggiunto un file alla creazione di una attrezzatura
  fileNameSal = '';
  fileNameCertificato = '';
  fileNameFattura = '';
  formDataSal = new FormData();
  formDataCertificato = new FormData();
  formDataFattura = new FormData();
  formData = new FormData()
  /**
   *
   * @param service
   * @param router servizio di routing iniettato da Angular
   */
  constructor(private _fileservice: FileService, private spinner: NgxSpinnerService, private _salfatturaService: SalFatturaService, private service: CantieriService, private router: Router, private modalService: NgbModal, private servicepersonale: PersonaleService) {

  }
  ngOnInit(): void {
    this._salfatturaService.getAllSalFatture(this.targetCantiereId).subscribe(
      (res) => {
        LoggingService.log('Sal/fatture cantiere ottenute', LogLevel.debug, res);
        this.salFattureCantiere = res;

      },
      (err) => {
        LoggingService.log('ERRORE get Sal/fatture cantiere ', LogLevel.error, err);
      },
      () => { },
    )
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add personale', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.numeroFattura.indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.salFattureCantiere = temp;
  }
  // chiamata quando si clicca su una riga della tabella. Apre la visualizzazione della fattura
  viewSalFattura(event, modale) {
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
      this._salfatturaService.getSalFattura(event.row.id)
        .subscribe(
          (res) => {

            LoggingService.log('scaricato sal/fattura', LogLevel.debug, res);
            if (res.dataEmissioneSAL && res.dataEmissioneSAL.toString() == '0001-01-01T00:00:00') {
              res.dataEmissioneSAL = null;
            }
            if (res.dataEmissioneCP && res.dataEmissioneCP.toString() == '0001-01-01T00:00:00') {
              res.dataEmissioneCP = null;
            }
            if (res.dataEmissioneFattura && res.dataEmissioneFattura.toString() == '0001-01-01T00:00:00') {
              res.dataEmissioneFattura = null;
            }
            if (res.dataIncassoFattura && res.dataIncassoFattura.toString() == '0001-01-01T00:00:00') {
              res.dataIncassoFattura = null;
            }

            this.nuovafattura = res;
            this._salfatturaService.getAttachmentsFattura(event.row.id).subscribe(
              (res) => {
                this.nuovafattura.listFile = res;
                this.spinner.hide();
              },
              (err) => {
                console.error('Errore get attachments sal/fattura', err);
                this.spinner.hide();
              },
            )

          },
          (err) => {
            LoggingService.log('ERRORE scaricamento sal/fattura', LogLevel.error, err);
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
  // funzione utilizzata dai datepicker
  cambia(event, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8))
    switch (binding) {
      case 'dataEmissioneSal': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.dataEmissioneSAL = null;
          return
        }
        this.nuovafattura.dataEmissioneSAL = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la data di emissione sal è', LogLevel.debug, this.nuovafattura.dataEmissioneSAL);
        break;
      }
      case 'dataEmissioneCP': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.dataEmissioneCP = null;
          return
        }
        this.nuovafattura.dataEmissioneCP = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la data di emissione cp è', LogLevel.debug, this.nuovafattura.dataEmissioneCP);
        break;
      }
      case 'dataEmissioneFattura': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.dataEmissioneFattura = null;
          return
        }
        this.nuovafattura.dataEmissioneFattura = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la data di emissione fattura è', LogLevel.debug, this.nuovafattura.dataEmissioneFattura);
        break;
      }
      case 'dataScadenzaFattura': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.dataScadenzaFattura = null;
          return
        }
        this.nuovafattura.dataScadenzaFattura = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la datascadenzafattura  è', LogLevel.debug, this.nuovafattura.dataScadenzaFattura);
        break;
      }
      case 'dataIncassoFattura': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.dataIncassoFattura = null;
          return
        }
        this.nuovafattura.dataIncassoFattura = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la dataIncassoFattura è', LogLevel.debug, this.nuovafattura.dataIncassoFattura);
        break;
      }
      case 'dataInizioPeriodoRiferimento': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.startingReferralPeriodDate = null;
          return
        }
        this.nuovafattura.startingReferralPeriodDate = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        // this.nuovafattura.startingReferralPeriodDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        LoggingService.log('la dataInizioPeriodoRiferimento è', LogLevel.debug, this.nuovafattura.startingReferralPeriodDate);
        break;
      }
      case 'dataFinePeriodoRiferimento': {
        if (event.year == null || event.month == null || event.day == null) {
          this.nuovafattura.endingReferralPeriodDate = null;
          return
        }
        this.nuovafattura.endingReferralPeriodDate = new Date(event.year, event.month, event.day, ore, minuti, secondi).toISOString().substring(0, 10);
        LoggingService.log('la dataFinePeriodoRiferimento è', LogLevel.debug, this.nuovafattura.endingReferralPeriodDate);
        break;
      }
      default: {
        // statements;
        break;
      }
    }

  }


  // metodo utilizzato dal tasto "aggiungi Fattura" per aprire un popup
  openLg(content) {
    this.modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false, scrollable: true
    });
  }

  // funzione chiamata al click del bottone modifica sulla riga della tabella
  onModify(modale, fattura: ListaSalFattureCantiere) {

    this._salfatturaService.getSalFattura(fattura.id)
      .subscribe(
        (res) => {
          LoggingService.log('salfattura da modificare scaricata', LogLevel.debug, res);
          this.nuovafattura = res;

        },
        (err) => {
          LoggingService.log('ERRORE get salfattura da modificare', LogLevel.error, err);
        },
        () => {
          this.modalService.open(modale, { size: 'xl' });
        },
      )
  }
  // funzione chiamata al click del tasto Conferma nel popup di creazione
  aggiungiSalFattura() {

    LoggingService.log('la fattura da aggiungere è ', LogLevel.debug, this.nuovafattura);
    console.log(this.formDataSal.get('formFiles'), this.formDataCertificato.get('formFiles'), this.formDataFattura.get('formFiles'));
    // metto gli allegati in un unico formdata
    this.formData.append('formFiles', this.formDataSal.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    this.formData.append('formFiles', this.formDataCertificato.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    this.formData.append('formFiles', this.formDataFattura.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    console.log(this.formData.getAll('formFiles'));
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.nuovafattura.idCantiere = this.targetCantiereId;
    delete this.nuovafattura.id;

    this._salfatturaService.postFattura(this.nuovafattura).subscribe(
      (res) => {
        LoggingService.log('nuova fattura postata con successo', LogLevel.debug, res);

        this.nuovafattura.id = res.id;
        const allegati = this.formData.getAll('formFiles');
        let attachments = false;
        for (const allegato of allegati) {
          if (allegato != 'null') {
            attachments = true;
            break;
          }
        }
        if (attachments) {
          console.log(this.formData.getAll('formFiles'));
          this.postaAllegati();
          // refresho la tabella dentro la funzione postaAllegati
        } else {

          this.salFattureCantiere.unshift(this.nuovafattura);
          this.salFattureCantiere = [... this.salFattureCantiere];
          this.clearData();
          this.tempData = this.salFattureCantiere;
          this.spinner.hide();

          swal.fire({
            title: 'Sal/Fattura Creata!',
            text: 'La sal/fattura è stata aggiunta nella tabella',
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
        LoggingService.log('ERRORE post nuova sal fattura', LogLevel.debug, err);
        this.spinner.hide();
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'L\'elemento NON è stato creato. Riprova riempiendo tutti i campi del form.',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
        // svuoto solo gli allegati
        this.fileNameSal = '';
        this.fileNameCertificato = '';
        this.fileNameFattura = '';
        this.formDataSal = new FormData();
        this.formDataCertificato = new FormData();
        this.formDataFattura = new FormData();
        this.formData = new FormData();
      },
      () => { },
    )

    // ricarico la tabella
    // this.salFattureCantiere = [...this.salFattureCantiere];
    // this.clearData();

  }

  // funzione chiamata al download di uno degli allegati di una SAL/Fattura
  downloadAttachment(file: _File) {
    console.log(file);
    this._salfatturaService.downloadAttachment(file);
  }
  // funzione chiamata quando si vuole eliminare un allegato da un record di tabella
  RemoveAttachment(allegato: _File, index: number) {
    LoggingService.log('allegato da eliminare', LogLevel.debug, allegato)
    console.log(allegato);

    const id = [allegato.id];

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
                  this.nuovafattura.listFile.splice(index, 1);

                },
              )
          }
        })
      }
    })
  }
  // chiamata in automatico dopo la postFattura
  postaAllegati() {

    this._salfatturaService.postAttachmentToFattura(this.nuovafattura.id, this.formData)
      .subscribe(
        (res) => {

          LoggingService.log('risposta post file allegato attrezzatura', LogLevel.debug, res);
          this.nuovafattura.listFile = []; // lo faccio per evitare che sia undefined
          res.forEach(element => {
            this.nuovafattura.listFile.push(element)
          })

          this.salFattureCantiere.unshift(this.nuovafattura);
          this.salFattureCantiere = [... this.salFattureCantiere];
          this.clearData();
          this.tempData = this.salFattureCantiere;
          this.spinner.hide();

          swal.fire({
            title: 'Elemento Creato!',
            text: 'L\'elemento è stato aggiunto nella tabella, compreso di allegato/i',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {

          this.salFattureCantiere.unshift(this.nuovafattura);
          this.salFattureCantiere = [... this.salFattureCantiere];
          this.clearData();
          this.tempData = this.salFattureCantiere;
          this.spinner.hide();
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
          LoggingService.log('ERRORE risposta post file allegato nota', LogLevel.warn, err);
          this.spinner.hide();

          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\'elemento è stato aggiunto ma NON è stato possibile aggiungere il/gli allegati',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.clearData()
        },
      )
  }
  updateSalFatture() {
    LoggingService.log('formdata nell\'update è', LogLevel.debug, this.formData.getAll('formFiles'));
    this.formData.append('formFiles', this.formDataSal.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    this.formData.append('formFiles', this.formDataCertificato.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    this.formData.append('formFiles', this.formDataFattura.get('formFiles')); // se è vuoto in formData verrà inserita la stringa "null"
    console.log(this.formData.getAll('formFiles'));
    // aggiungo il personale nella nuovaTaggednota
    this.spinner.show(undefined,
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });

    this._salfatturaService.updateFattura(this.nuovafattura.id, this.nuovafattura)
      .subscribe(
        (res) => {
          LoggingService.log('ok update andato', LogLevel.debug, res);
          this.spinner.hide();
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'L\'elemento è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          LoggingService.log('prima dello splice', LogLevel.debug, { ...this.salFattureCantiere });
          LoggingService.log('index of prima', LogLevel.debug, this.salFattureCantiere.indexOf(
            this.salFattureCantiere.find(x => x.id === this.nuovafattura.id)
          ));

          // pos contiene la posizione della nota da modificare
          const pos = this.salFattureCantiere.indexOf(this.salFattureCantiere.find(x => x.id == this.nuovafattura.id));
          // sovrascrivo l'oggetto in posizione pos con la nuovaTsggedNota
          this.salFattureCantiere[pos] = this.nuovafattura;
          LoggingService.log('Sal fatture dopo l\'update è diventata', LogLevel.debug, this.salFattureCantiere);
          // aggiorno tempdata per il filtro di ricerca
          this.tempData = this.salFattureCantiere;
          // ricarico la tabella
          this.salFattureCantiere = [...this.salFattureCantiere];
          // se la nota contiene un file allegato, posto anche il file
          // se ho anche aggiunto un allegato lo posto, ma non ho bisogno di aggiornare la tabella
          if (this.formData.getAll('formFiles').length > 0) {
            this._salfatturaService.postAttachmentToFattura(this.nuovafattura.id, this.formData)
              .subscribe(
                (res: _File[]) => {
                  LoggingService.log('allegati sal fattura aggiornati', LogLevel.debug, res);

                },
                (err) => {
                  LoggingService.log('ERRORE update allegati sal/fatture ', LogLevel.error, err);
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
            text: 'L\'elemento NON è stata modificato',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {

        }
      );
  }
  clearData() {
    this.nuovafattura = new ListaSalFattureCantiere();
    this.fileNameSal = '';
    this.fileNameCertificato = '';
    this.fileNameFattura = '';
    this.formDataSal = new FormData();
    this.formDataCertificato = new FormData();
    this.formDataFattura = new FormData();
    this.formData = new FormData();
  }
  // chiamata quando si cancella un allegato nel popup di creazione di una fattura
  deleteAttachmentNote(type: string) {
    switch (type) {
      case 'sal': {
        // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
        (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

        this.fileNameSal = '';
        this.formDataSal = new FormData();
        break;
      }
      case 'certificato': {
        // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
        (document.getElementById('inputGroupFile02') as HTMLInputElement).value = null;

        this.fileNameCertificato = '';
        this.formDataCertificato = new FormData();
        break;
      }
      case 'fattura': {
        // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
         (document.getElementById('inputGroupFile03') as HTMLInputElement).value = null;

        this.fileNameFattura = '';
        this.formDataFattura = new FormData();
        break;
      }

      default: {
        console.error('errore eliminazione allegato');
        break;
      }
    }

  }
  // chiamata quando nel popup della view si decide di eliminare un allegato
  removeAttachment(file) {
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
                  this.nuovafattura.listFile.splice(this.nuovafattura.listFile.findIndex(x => x.id == file.id), 1);
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

  // metodo chiamato quando viene aggiunto un file alla creazione di un nuovo sal/fattura
  addFileToNota(event, type: string) {
    LoggingService.log('file caricato', LogLevel.debug, event);
    const files = event.target.files;
    LoggingService.log('filexxx', LogLevel.debug, files);
    // this.formData.append("formFiles", files);
    switch (type) {
      case 'sal': {
        if (files) {
          this.fileNameSal = files[0].name + '; ';
          this.formDataSal.append('formFiles', files[0]);
        }
        break;
      }
      case 'certificato': {
        if (files) {
          this.fileNameCertificato = files[0].name + '; ';
          this.formDataCertificato.append('formFiles', files[0]);
        }
        break;
      }
      case 'fattura': {
        if (files) {
          this.fileNameFattura = files[0].name + '; ';
          this.formDataFattura.append('formFiles', files[0]);
        }
        break;
      }
      default:
        break;
    }


  }
  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  // chiamata quando si intende eliminare una salFattura
  ConfirmText(row) {

    let str: string;
    const str2 = 'Elimina la fattura selezionata dal cantiere';
    const check = true;
    const text = 'L\'azione è irreversibile';
    // if (this.selected.length == 0) {
    //   str = 'Nessuna fattura selezionata';
    //   str2 = '';
    //   check = false;
    //   text = "";
    // }
    // else if (this.selected.length == 1) {
    str = 'Vuoi eliminare la fattura selezionata dal cantiere?';
    // }
    // else if (this.selected.length > 1) {
    //   str = "Vuoi eliminare " + this.selected.length + ' fatture dal cantiere?';
    // }

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
        // for (let i = 0; i < this.selected.length; i++) {
        //   this.checked[i] = this.selected[i].id
        // }
        // LoggingService.log("array di fatture da eliminare", LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this._salfatturaService.deleteSalFattura(row.id)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)

              this.salFattureCantiere.splice(
                this.salFattureCantiere.indexOf(
                  this.salFattureCantiere.find(x => x.id == row.id)
                ),
                1
              )

              this.salFattureCantiere = [...this.salFattureCantiere];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'La fattura selezionata è stata cancellata',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'La fattura selezionata NON è stata cancellata',
                customClass: {
                  confirmButton: 'btn btn-danger'
                }
              });
            },
            () => { }
          )
      }
    })

  }

  validationForm(form) {
    // calcolo importo netto CP
    this.calculateNetAmountCP();

    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }

  calculateNetAmountCP() {
    let netAmountCPNonArrotondato: number = null;
    if ((this.nuovafattura.netAmountSAL != null && this.nuovafattura.netAmountSAL != '')) {

      // && (this.nuovafattura.contractualAdvance != null && this.nuovafattura.contractualAdvance != "") && (this.nuovafattura.accidentsWithholding != null && this.nuovafattura.accidentsWithholding != ""))
      if (!this.nuovafattura.contractualAdvance || this.nuovafattura.contractualAdvance == '') {
        this.nuovafattura.contractualAdvance = '0';
      }
      if (!this.nuovafattura.accidentsWithholding || this.nuovafattura.accidentsWithholding == '') {
        this.nuovafattura.accidentsWithholding = '0';
      }
      if (!this.nuovafattura.iva || this.nuovafattura.iva == '') {
        this.nuovafattura.iva = '0';
      }

      this.nuovafattura.netAmountCP = Number.parseFloat((Number.parseFloat(this.nuovafattura.netAmountSAL) - (Number.parseFloat(this.nuovafattura.netAmountSAL) * Number.parseFloat(this.nuovafattura.contractualAdvance) / 100) - (Number.parseFloat(this.nuovafattura.netAmountSAL) * Number.parseFloat(this.nuovafattura.accidentsWithholding) / 100)).toFixed(2));
      netAmountCPNonArrotondato = (Number.parseFloat(this.nuovafattura.netAmountSAL) - (Number.parseFloat(this.nuovafattura.netAmountSAL) * Number.parseFloat(this.nuovafattura.contractualAdvance) / 100) - (Number.parseFloat(this.nuovafattura.netAmountSAL) * Number.parseFloat(this.nuovafattura.accidentsWithholding) / 100))

      // importo netto della fattura è sempre uguale a importo netto CP
      this.nuovafattura.netAmountFattura = this.nuovafattura.netAmountCP;
      // this.nuovafattura.netAmountFattura = netAmountCPNonArrotondato;
      console.warn(this.nuovafattura);

    } else {
      console.warn('netamount nullo');
      console.warn(this.nuovafattura);
      this.nuovafattura.netAmountCP = null;
      this.nuovafattura.netAmountFattura = null;
      netAmountCPNonArrotondato = null;
    }
    // in ogni caso calcolo l'importo ivato
    this.calculateImportoIvatoFattura(netAmountCPNonArrotondato);
  }
  calculateImportoIvatoFattura(netAmountCPNonArrotondato: number) {
    console.warn('ivaaa', netAmountCPNonArrotondato);
    if (this.nuovafattura.iva != null && this.nuovafattura.iva != '' && netAmountCPNonArrotondato != null) {
      this.nuovafattura.ivaAmountFattura = Number.parseFloat((netAmountCPNonArrotondato + (netAmountCPNonArrotondato * Number.parseFloat(this.nuovafattura.iva) / 100)).toFixed(2));
    } else {
      this.nuovafattura.ivaAmountFattura = null;
    }
  }
}



