import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { EstrazioneDatiPersonaleMezziModel, Personale } from 'app/models/personale.model';
import { NgbDate, NgbModal, NgbTimepickerConfig, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import swal from 'sweetalert2';
import {NgSelectConfig} from '@ng-select/ng-select';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthService} from 'app/shared/auth/auth.service';
import {PdfService} from '../../../shared/services/pdf.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeesComponent implements OnInit {
;
  // array che contiene tutto il personale esistente
  personale: Personale[];
  columnMode = ColumnMode;
  private tempData = [];
  // personale che si popolerà con le nuove informazioni inserite nel form
  nuovopersonale = new Personale();
  skills = [];
  // variabile che contiene la data di nascita inserita(non è possibile usare nuovopersonale.birthday perchè è di tipo string)
  data: Date;
  // variabili usata quando viene aggiunto un file alla creazione di una cliente
  fileName = '';
  formData = new FormData();

  titoli = ['Sig.', 'Sig.Ra', 'Ing.', 'Geom.', 'Arch.', 'Dott.'];
  contratti = ['Tempo determinato', 'Tempo indeterminato', 'CO.CO.CO', 'Apprendistato', 'Somministrazione', 'Prestazione Occasionale', 'Prestazione d\'opera', 'Tirocinio', 'Distacco'];
  ruoliOrganigramma = ['Impiegato tecnico', 'Operaio', 'Responsabile HSE', 'Magazzino', 'DL/DT', 'AMM', 'DT', 'ACOM'];

  limit: number = 25;

  estraiDatiModel = new EstrazioneDatiPersonaleMezziModel();

  constructor(private pdf: PdfService, private cdRef: ChangeDetectorRef, private http: HttpClient, private _spinner: NgxSpinnerService, private ngselect: NgSelectConfig, private router: Router, private modalService: NgbModal, private personaleservice: PersonaleService, private authService: AuthService) {
    // modifica ng-select(menu a tendina presente nel form di creazione personale)
    this.ngselect.notFoundText = 'Nessun elemento trovato';
    this.ngselect.addTagText = 'Aggiungi tag';

  }

  ngAfterViewInit(): void {

    const tableRef = document.getElementById('ngx-datatable-personale');
    tableRef.click();
  }

  ngOnInit() {
    this.personaleservice.getAllPersonale()
      .subscribe(
        (res) => {
          this.personale = res;
          LoggingService.log('intero personale ottenuto', LogLevel.debug, this.personale)
        },
        (err) => {
          LoggingService.log('errore get intero personale', LogLevel.debug, err)
        },
        () => {
          // popolo il campo fullname con una semplice concatenazione di due stringhe
          this.personale.forEach(i => {
            if (i.name != undefined && i.surname != undefined) {
              i.fullName = i.surname + ' ' + i.name;
            }
          });
          this.tempData = this.personale;
          LoggingService.log('xxxxx intero personale', LogLevel.debug, this.tempData);
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-personale');
          tableRef.click();
        }
      )
  }

  onEdit(target: Personale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/personale/', target.id]);
  }

  openLg(content) {
    this.modalService.open(content, {size: 'xl'});
  }

  // funzione utilizzata dal datepicker
  cambia(event: NgbDate, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    switch (binding) {
      case 'datanascita': {
        if (event.month != 9 && event.month != 10 && event.month != 11 && event.month != 12) {
          this.nuovopersonale.birthday = event.year + '/' + '0' + (event.month + 1).toString() + '/' + event.day;
        } else {
          this.nuovopersonale.birthday = event.year + '/' + (event.month + 1).toString() + '/' + event.day;
        }
        LoggingService.log('la data di nascita del nuovo personale è', LogLevel.debug, this.nuovopersonale.birthday);
        break;
      }
      default: {
        LoggingService.log('problemino col datepicker', LogLevel.debug);
        // statements;
        break;
      }
    }
  }

  creaPersonale() {
    this.nuovopersonale.fullName = this.nuovopersonale.name + ' ' + this.nuovopersonale.surname;
    if (this.nuovopersonale.cf) {
      this.nuovopersonale.cf = this.nuovopersonale.cf.toUpperCase();
    }
    this.nuovopersonale.skills = '';

    this.skills.forEach(element => {
      LoggingService.log('la skill è', LogLevel.debug, element);
      this.nuovopersonale.skills = this.nuovopersonale.skills.concat(element + '$')
    });
    LoggingService.log('il nuovopersonale è', LogLevel.debug, this.nuovopersonale);
    this._spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.personaleservice.postPersonale(this.nuovopersonale)
      .subscribe(
        (res) => {
          LoggingService.log('nuovopersonale postato con successo', LogLevel.debug, res);
          this.nuovopersonale.id = res.id;
          this._spinner.hide();

          swal.fire({
            title: 'Personale Creato!',
            text: 'La persona è stata aggiunta nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });

          this.personale.unshift(this.nuovopersonale);
          this.personale = [...this.personale];
          this.clearData();
          this.formData = new FormData();
        },
        (err: HttpErrorResponse) => {
          LoggingService.log('ERRORE post nuovopersonale', LogLevel.debug, err);
          this._spinner.hide();
          var t = 'La persona NON è stata creata.';
          if (err.status == 409) {
            t = 'L\'email inserita è già correlata ad un personale o ad un utente esistente';
          }
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: t,
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        }
      )

  }

  downloadPdf() {
    if (this.personale.length > this.limit) {

      let l = this.limit
      this.limit = this.personale.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-personale', `personale`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-personale', `personale`, null, this._spinner)
    }

  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro', LogLevel.debug, event.target.value.toLowerCase())

    const temp = this.tempData.filter(function (d) {
      return d.fullName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.personale = temp;

  }

  // funzione chiamata quando si clicca su una riga
  rowClick(event) {
    if (event.type == 'dblclick') {
      this.onEdit(event.row)
    }
  }

  clearData() {
    this.fileName = '';
    this.nuovopersonale = new Personale();
  }

  // cancella la data selezionata dal datepicker
  clearDate() {
    this.data = null;
    delete this.nuovopersonale.birthday
  }

  // funzione chiamata quando nel form di creazione viene aggiunto un allegato(una foto)
  addImageToPersonale(event) {
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
    // formdata satà sempre costituito da un unico file in questo caso
    // const file=this.formData.get("formFiles");
    const file = event.target.files[0] as File
    LoggingService.log('file è', LogLevel.warn, file);
    if (file.size > 1500000) {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato supera le dimensioni di 1,5MB. Riprova con uno piu leggero.',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
      this.deleteImagePersonale();
    }
    if (file.type.substring(0, 5) != 'image') {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato non è una immagine. Riprova',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
      this.deleteImagePersonale();
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.nuovopersonale.file = reader.result;
    };
  }  // funzione chiamata quando nel form di creazione si eliminano gli allegati aggiunti
  deleteImagePersonale() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }

  deletePersonale(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il personale selezionato';
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
          cancelButtonText: 'No scherzavo',
          confirmButtonText: 'Si sono sicuro',
          customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-info ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            LoggingService.log('event è', LogLevel.debug, event.id)
            this.personaleservice.deletePersonale(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('personale eliminato con statuscode:', LogLevel.debug, res.status);
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
                  LoggingService.log('errore eliminazione personale', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il personale selezionato NON è stato cancellato. Controlla che non sia il PM di qualche contratto o se non sia presente in qualche report di cantiere',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.personale.splice(
                    this.personale.indexOf(
                      this.personale.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.personale = [...this.personale];
                  this.tempData = this.personale;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  // funzione usata dall'ng-select nel form per le skill
  addCustomUser = (term) => ({id: term, name: term});

  printa() {
    LoggingService.log('skills è', LogLevel.debug, this.skills);
  }

  estraiDettagli(type: 'xlsx' | 'pdf') {
    this._spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.personaleservice.estraiDatiPersonale(this.estraiDatiModel.ids, type, this.estraiDatiModel.dateFrom, this.estraiDatiModel.dateTo)
      .subscribe(
        (res: HttpResponse<any>) => {
          if (res.status == HttpStatusCode.NoContent) {
            swal.fire({
              icon: 'info',
              title: 'Nessun dato presente',
              text: "Non ci sono dati da estrapolare per il personale selezionato",
              customClass: {
                confirmButton: 'btn btn-danger'
              }
            });
            this._spinner.hide()
            return;
          }
          let fileType = type=='xlsx'? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/pdf';
          let fileName = `Estrazione Personale.${type}`;

          // Crea un link nascosto, imposta l'URL del Blob e inizia il download
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob([res.body], { type: fileType }));
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();

          // Pulizia
          window.URL.revokeObjectURL(downloadLink.href);
          document.body.removeChild(downloadLink);
          this._spinner.hide()
        },
        (err) => {
          this._spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: '',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        })
  }
}

