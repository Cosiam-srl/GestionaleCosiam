import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ColumnMode} from '@swimlane/ngx-datatable';
import {HttpClient} from '@angular/common/http';
import {Mezzo} from 'app/models/mezzo.model';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MezziService} from 'app/shared/services/data/mezzi.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {SystemParametersService} from 'app/shared/services/configs/system-parameters.service';
import {lastValueFrom} from 'rxjs';
import {NgxSpinnerService} from 'ngx-spinner';
import {EstrazioneDatiPersonaleMezziModel} from 'app/models/personale.model';
import {PdfService} from '../../../../shared/services/pdf.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})

export class VehiclesComponent implements OnInit {
  // array che contiene tutto il personale esistente
  mezzi: Mezzo[];
  columnMode = ColumnMode;
  private tempData = [];

  // mezzo che si popolerà con le nuove informazioni inserite nel form
  nuovomezzo = new Mezzo();
  // variabile che fa binding col campo contoProprio/contoTerzi nel form di creazione del mezzo
  contoproprioterzi: string;
  // roba per il form
  fff = false;
  limit: number = 25;

  estraiDatiModel = new EstrazioneDatiPersonaleMezziModel();

  constructor(private cdRef: ChangeDetectorRef, private pdf: PdfService, private http: HttpClient,
              private router: Router,
              private modalService: NgbModal,
              private mezziservice: MezziService,
              private _spinner: NgxSpinnerService,
              private _systemParametersService: SystemParametersService
  ) {
  }

  ngOnInit() {
    registerLocaleData(localeIt, 'it');
    this.mezziservice.getAllMezzi()
      .subscribe(
        (res) => {
          this.mezzi = res;
          this.mezzi = [...this.mezzi];
          LoggingService.log('mezzi ottenuti', LogLevel.debug, this.mezzi)
        },
        (err) => {
          LoggingService.log('errore get mezzi', LogLevel.debug, err)
        },
        () => {
          this.tempData = this.mezzi;
          LoggingService.log('xxxxx mezzi ', LogLevel.debug, this.tempData);
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-mezzi');
          tableRef.click();
        }
      )
  }

  onEdit(target: Mezzo) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cantiere
    this.router.navigate(['/page/dashboards/mezzi/', target.id]);
  }

  openLg(content) {
    this.modalService.open(content, {size: 'xl'});
  }

  // funzione che raccoglie alcuni input inseriti nel form di crea cantiere

  creaMezzo() {
    LoggingService.log('il nuovomezzo è', LogLevel.debug, this.nuovomezzo);
    // finisco di popolare l'ultimo campo del nuovomezzo
    if (this.contoproprioterzi == 'true') {
      this.nuovomezzo.contoProprioContoTerzi = true;
    } else {
      this.nuovomezzo.contoProprioContoTerzi = false;
    }
    this.mezziservice.postMezzo(this.nuovomezzo)
      .subscribe(
        (res) => {
          LoggingService.log('nuovomezzo postato con successo', LogLevel.debug, res);
          this.nuovomezzo.id = res.id;

          swal.fire({
            title: 'Mezzo Creato!',
            text: 'Il mezzo è stata aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'

            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovomezzo', LogLevel.debug, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il mezzo NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.mezzi.unshift(this.nuovomezzo);
          this.mezzi = [...this.mezzi];
          this.clearData();
          this.tempData = this.mezzi;
        }
      )

  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro', LogLevel.debug, event.target.value.toLowerCase())

    const temp = this.tempData.filter(function (d) {
      return d.description.toLowerCase().indexOf(val) !== -1 || d.brand.toLowerCase().indexOf(val) !== -1 || d.licensePlate.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.mezzi = temp;

  }

  // funzione chiamata quando si clicca su una riga
  rowClick(event) {
    if (event.type == 'dblclick') {
      this.onEdit(event.row)
    }
  }

  clearData() {
    this.nuovomezzo = new Mezzo();
    this.fff = false;
  }

  test() {
    LoggingService.log('prova', LogLevel.debug, this.nuovomezzo.wearBook);
    LoggingService.log('prova2', LogLevel.debug, this.nuovomezzo.tachograph);
  }

  // funzione chiamata dai datepicker
  cambia(event, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);
    LoggingService.log('binding è', LogLevel.debug, binding);
    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    switch (binding) {
      case 'scadenzaAssicurazione': {
        this.nuovomezzo.insuranceExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'scadenzaRevisione': {
        this.nuovomezzo.revisionExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'scadenzaBollo': {
        this.nuovomezzo.stampDutyExpirationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'tachigrafo': {
        this.nuovomezzo.tachograph = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'dataImmatricolazione': {
        this.nuovomezzo.matriculationDate = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'licenzaCProprio': {
        this.nuovomezzo.licenseCProprio = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'libretto usura': {
        this.nuovomezzo.wearBook = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'furto/incendio': {
        this.nuovomezzo.furtoIncendio = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'ispsel': {
        this.nuovomezzo.ispsel = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      case 'verifica ventennale': {
        this.nuovomezzo.TwentyYearVerificationOfLiftingOrgans = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        break;
      }
      default: {
        // statements;
        break;
      }
    }

  }

  deleteMezzo(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il mezzo selezionato';
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
            this.mezziservice.deleteMezzo(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('mezzo eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il mezzo selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione mezzo', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il mezzo selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.mezzi.splice(
                    this.mezzi.indexOf(
                      this.mezzi.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.mezzi = [...this.mezzi];
                  this.tempData = this.mezzi;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
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

  async setGasolinePrice() {
    var x = await lastValueFrom(this._systemParametersService.getByKey('gas'));
    swal.fire({
      title: 'Inserisci il prezzo del carburante (€)',
      input: 'number',
      inputAttributes: {
        autocapitalize: 'off',
        step: '0.001' // Consente valori con tre cifre decimali
      },
      inputPlaceholder: 'Esempio: 1.349', // Guida l'utente a inserire il valore corretto
      showCancelButton: true,
      cancelButtonText: 'Annulla',
      inputValue: x.value,
      confirmButtonText: 'Conferma',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !swal.isLoading()
    }).then(async (result) => {
      console.log(result);
      if (result.isDismissed || result.isDenied || result.value == x) {
        return;
      }
      var x = await lastValueFrom(this._systemParametersService.createOrUpdateParam({key: 'gas', value: result.value}))
        .catch(() => {
            console.error('errore update parametro');
            swal.fire({
              title: `Errore nel salvataggio del prezzo del carburante`,
              icon: 'error'
            })
          }
        );
      console.log(x);
      swal.fire({
        title: result.value ? `Prezzo del carburante impostato a € ${result.value}` : 'Prezzo del carburante eliminato',
        icon: 'success'
      })

    })
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
    this.mezziservice.estraiDatiMezzi(this.estraiDatiModel.ids, type, this.estraiDatiModel.dateFrom, this.estraiDatiModel.dateTo)
      .subscribe(
        (res: any) => {
          let fileType = type == 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
          let fileName = `Estrazione Mezzi.${type}`;

          // Crea un link nascosto, imposta l'URL del Blob e inizia il download
          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob([res], {type: fileType}));
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

  downloadPdf() {
    if (this.mezzi.length > this.limit) {

      let l = this.limit
      this.limit = this.mezzi.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-mezzi', `mezzi`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        },this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-mezzi', `mezzi`, null, this._spinner)
    }

  }
}
