import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { _File } from 'app/models/file.model';
import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { FileService } from 'app/shared/services/data/file.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-files-cantieri',
  templateUrl: './files-cantieri.component.html',
  styleUrls: ['./files-cantieri.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilesCantieriComponent implements OnInit {

  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // Evento di caricamento del file(serve per la galleria)
  @Output() fileSelected = new EventEmitter<_File>();
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;
  // variabile utilizzata per l'apertura del popup aggiungi personale
  size: number;

  // array che contiene tutti i file del cantiere
  fileget: _File[] = []

  // array che contiene gli id dei file selezionate usando le checkbox
  checked: number[] = [];

  // variabile utile per il caricamento dei file
  fileName = '';
  form: FormGroup;
  // variabile che contiene la risposta del postFile
  rispostaPost: number;

  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];

  filePostUrl = '';


  /**
   *
   * @param service
   * @param router servizio di routing iniettato da Angular
   */
  constructor(private service: CantieriService, private router: Router, private modalService: NgbModal, private files: FileService) {

  }

  ngOnInit(): void {
    // acquisisco i file relativi a questo cantiere
    this.service.getFileCantiere(this.targetCantiereId)
      .subscribe(
        (res) => {
          console.log('File cantiere scaricati', res)
          this.fileget = res; this.tempData = res;
        },
        (err) => {
          LoggingService.log('errore nel get dei file del cantiere', LogLevel.warn, err)
        },
        () => {

        }
      );

    this.filePostUrl = this.service.postFileCantiereUrl(this.targetCantiereId);
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.fileName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.fileget = temp;

  }
  // funzione chiamata al click dell'azione di una riga della tabella
  onDownload(target: _File) {
    LoggingService.log('richiesto download per file con id', LogLevel.debug, target);
    this.files.downloadFile(target);


    // this.files.downloadFile(target.id)
    //   .subscribe(
    //     (blob) => {
    //       const a = document.createElement('a');
    //       const objectUrl = URL.createObjectURL(blob);
    //       a.href = objectUrl;
    //       a.download = target.fileName;//file.name;
    //       a.click();
    //       URL.revokeObjectURL(objectUrl);
    //     },
    //     (err) => {
    //       swal.fire({
    //         icon: "error",
    //         title: 'C\'è stato un problema!',
    //         text: 'Non è possibile scaricare i seguente file',
    //         customClass: {
    //           confirmButton: 'btn btn-danger'
    //         }
    //       });
    //     }
    //   )
  }

  // metodo per controllare lo stato delle checkbox(true o false)
  onChange(file_id: number, event: any) {
    // personale.nome equivale all'identificatore(l'elemento che identifica in modo univoco quel record della tabella)
    LoggingService.log('box selezionato personale', LogLevel.debug, [file_id, event.target.checked]);

    // se ho selezionato l'elemento lo inserisco nell'array checked
    if (event.target.checked) {
      this.checked.push(file_id);
    } else {
      // altrimenti lo tolgo dall'array checked
      this.checked.splice(this.checked.indexOf(file_id), 1);
    }

    LoggingService.log('array di checkbox personale cantiere', LogLevel.debug, this.checked);
  }
  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }



  // metodo per il caricamento(upload) dei file, NON PIU UTILIZZATO
  onFileSelected(event) {

    const file: File = event.target.files[0];
    LoggingService.log('file caricato', LogLevel.debug, file);

    if (file) {
      this.fileName = file.name;
      LoggingService.log('file name è', LogLevel.debug, this.fileName);
      const formData = new FormData();
      formData.append('formFile', file);
      

      this.service.postFileCantiere(this.targetCantiereId, formData)
        .subscribe(
          (res) => {
            // emetto l'evento di un file caricato(serve alla galleria immagini)
            this.fileSelected.emit(res);
            swal.fire({
              title: 'File aggiunto !',
              text: 'Il file è stato aggiunto nella tabella',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'

              },
              buttonsStyling: false,
              confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
            });
            // aggiorno la tabella
            this.fileget.unshift(res),
              this.fileget = [...this.fileget],
              // svuoto il testo di fianco al tasto "carica"
              setTimeout(() => {
                this.fileName = ''
              }, 5000);

          },
          (err) => {
            LoggingService.log('errore nel post dei file del cantiere', LogLevel.warn, err),
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I file selezionati NON sono stati caricati',
                customClass: {
                  confirmButton: 'btn btn-danger'
                }
              });
          },
          () => { LoggingService.log('file del cantiere postato', LogLevel.debug, this.rispostaPost) }
        )
    }
  }

  // evento innescato quando il componente uploader ha caricato il file
  onFileUpload(event: _File) {
    LoggingService.log('Evento file upload', LogLevel.debug, event);
    this.fileSelected.emit(event);
    swal.fire({
      title: 'File aggiunto !',
      text: 'Il file è stato aggiunto nella tabella',
      icon: 'success',
      customClass: {
        confirmButton: 'btn btn-primary'

      },
      buttonsStyling: false,
      confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
    });
    // aggiorno la tabella
    this.fileget.unshift(event),
      this.fileget = [...this.fileget],
      // svuoto il testo di fianco al tasto "carica"
      setTimeout(() => {
        this.fileName = ''
      }, 5000);
  }

  // metodo chiamato al click del tasto "elimina file"
  ConfirmText() {

    let str: string;
    let str2 = 'Elimina il file selezionato dal cantiere';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun file selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare il file selezionata dal cantiere?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' file dal cantiere?';
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
        LoggingService.log('array di file report HSE da eliminare', LogLevel.debug, this.checked)
        this.files.deleteFiles(this.checked)
          .subscribe(
            (res) => {
              for (const file of this.checked) {
                this.fileget.splice(
                  this.fileget.indexOf(
                    this.fileget.find(x => x.id == file)
                  ),
                  1
                )
              }
              // aggiorno la tabella
              this.fileget = [...this.fileget];
              this.tempData = [...this.fileget];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              // popup di successo
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'I file selezionati sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              LoggingService.log('errore delete files', LogLevel.debug, err)
              // popup di errore
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I file selezionati NON sono stati cancellati',
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
