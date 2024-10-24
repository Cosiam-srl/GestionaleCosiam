import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ColumnMode} from '@swimlane/ngx-datatable';
import {HttpClient} from '@angular/common/http';
import {Supplier} from 'app/models/supplier.model';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SupplierService} from 'app/shared/services/data/supplier.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {SafeResourceUrl} from '@angular/platform-browser';
import {PdfService} from '../../../shared/services/pdf.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SuppliersComponent implements OnInit {
;
  // array che contiene tutto il personale esistente
  fornitori: Supplier[];
  columnMode = ColumnMode;
  private tempData = [];
  // roba per il form
  fff = false;

  limit: number = 25;

  // fine roba per form
  // variabili usata quando viene aggiunto un file alla creazione di una cliente
  fileName = '';
  formData = new FormData();
  // variabile usata per il logo del fornitore, visualizzato all'inizio della dashboard
  imageSource: SafeResourceUrl;

  // fornitore che si popolerà con le nuove informazioni inserite nel form
  nuovofornitore = new Supplier();

  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private http: HttpClient, private router: Router, private modalService: NgbModal, private fornitoriservice: SupplierService) {
  }

  // variabile che contiene la data di nascita inserita(non è possibile usare nuovopersonale.birthday perchè è di tipo string)

  ngOnInit() {
    this.fornitoriservice.getAllFornitori()
      .subscribe(
        (res) => {
          this.fornitori = res;
          this.tempData = res;
          LoggingService.log('fornitori ottenuto', LogLevel.debug, this.fornitori)
        },
        (err) => {
          LoggingService.log('errore get fornitori', LogLevel.debug, err)
        },
        () => {

          LoggingService.log('xxxxx fornitori ', LogLevel.debug, this.tempData);
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-suppliers');
          tableRef.click();
        }
      )
  }

  onEdit(target: Supplier) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/fornitori/', target.id]);
  }

  openLg(content) {
    this.modalService.open(content, {size: 'xl'});
  }

  // funzione che raccoglie alcuni input inseriti nel form di crea cantiere
  addDatiPersonale(event) {

  }

  downloadPdf() {
    if (this.fornitori.length > this.limit) {

      let l = this.limit
      this.limit = this.fornitori.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-suppliers', `fornitori`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-suppliers', `fornitori`, null, this._spinner)
    }

  }

  creaFornitore() {
    LoggingService.log('il nuovofornitore è', LogLevel.debug, this.nuovofornitore)
    this.fornitoriservice.postFornitore(this.nuovofornitore)
      .subscribe(
        (res) => {
          LoggingService.log('nuovopersonale postato con successo', LogLevel.debug, res);
          this.nuovofornitore.id = res.id;

          swal.fire({
            title: 'Fornitore Creato!',
            text: 'La persona è stata aggiunta nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovofornitore', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il fornitore NON è stata creata.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.fornitori.unshift(this.nuovofornitore);
          this.fornitori = [...this.fornitori];
          this.clearData();
        }
      )

  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro', LogLevel.debug, event.target.value.toLowerCase())

    const temp = this.tempData.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.fornitori = temp;

  }

  clearData() {
    this.nuovofornitore = new Supplier();
  }

  // funzione chiamata quando nel form di creazione viene aggiunto un allegato(una foto)
  addImageToFornitore(event) {
    this.fileName = '';
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
    if (file.size > 1000000) {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato supera le dimensioni di 1MB. Riprova con uno piu leggero.',
        customClass: {
          confirmButton: 'btn btn-danger'
        }
      });
      this.deleteImageFornitore();
      return;
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
      this.deleteImageFornitore();
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.nuovofornitore.file = reader.result;
    };
    this.fff = true;
  }

  // funzione chiamata quando nel form di creazione si eliminano gli allegati aggiunti
  deleteImageFornitore() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;
    this.fileName = '';
    this.formData = new FormData();
  }
  // chiamata quando si vuol rimuovere il logo senza sovrascriverlo con un altro
  removeLogoFornitore() {
    this.nuovofornitore.file = null;
    swal.fire({
      icon: 'warning',
      title: 'Importante!',
      text: 'Il logo verrà rimosso solo se confermi le modifiche. Se non lo fai, al ricaricamento della pagina troverai il logo precedente',
      customClass: {
        confirmButton: 'btn btn-success'
      },
    });
    this.fff = true;
  }

  deleteFornitore(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il fornitore selezionato';
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
            this.fornitoriservice.deleteFornitore(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('fornitore eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il fornitore selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione fornitore', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il fornitore selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.fornitori.splice(
                    this.fornitori.indexOf(
                      this.fornitori.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.fornitori = [...this.fornitori];
                  this.tempData = this.fornitori;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  validationForm(form) {

    if (form.status == 'VALID') {
      this.fff = true;
      return;
    } else {
      this.fff = false
      return;
    }
  }

  // var ciao = Object.keys(this.nuovofornitore);
  // //se la chiave obbligatoria non è nell'array, posso già terminare
  // var x = ciao.includes("piva") && ciao.includes("name") && ciao.includes("cf");
  // LoggingService.log("ret è", LogLevel.debug, form);
  // if (!x) {
  //   this.fff = false;
  //   return;
  // }
  // //superato il primo controllo, devo controllare che tutti i valori relativi alle chiavi obbligatorie devono essere non vuoti
  // for (const [key, value] of Object.entries(this.nuovofornitore)) {
  //   LoggingService.log("elemento", LogLevel.debug, [key, value]);
  //   if ((key == "name" && value == "") || (key == "piva" && value == "") || (key == "cf" && (value == "" || value.length != 16))) {
  //     this.fff = false;
  //     return;
  //   }
  // }
  // this.fff = true;

}
