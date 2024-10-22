import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { PrezziarioGenerale, ServizioCliente } from 'app/models/benieservizi.model';
import { PrezziarioGeneraleService } from 'app/shared/services/data/prezziariogenerale.service';

import { ServiziClienteService } from 'app/shared/services/data/servizicliente.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';
@Component({
  selector: 'app-prezziario',
  templateUrl: './prezziario.component.html',
  styleUrls: ['./prezziario.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrezziarioComponent implements OnInit {
  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  idPrezziarioGenerale: number;
  // array che contiene i servizi relativi a questo cantiere
  servizicliente: ServizioCliente[];
  // array che contiene gli id dei servizi selezionati usando le checkbox
  checked: number[] = [];
  // variabile che contiene un servizio da aggiungere al cantiere
  nuovoservizio = new ServizioCliente();
  // array di oggetti selezionati cliccando sulle righe della tabella
  selected: any[] = [];
  // variabili usata quando viene aggiunto un file
  fileName = '';
  formData = new FormData();
  // variabile utilizzata per la validazione del form
  fff = false;
  // unità di misura prestabilite
  ums = ['a corpo', 'cad', 'cadauno x giorno', 'cadauno x mese', 'cadauno x trefolo', 'cm', 'dm cubi', 'giorni', 'giorni x ml', 'h', 'ha', 'hm', 'kg', 'Km', 'kN', 'kN x cm', 'L', 'm', 'm²', 'm quadri / sett.', 'm³', 'm cubi x km', 'mese', 'mese x m lineari', 'ml', 'mq x 4 cm', 'mq x 5 cm', 'mq x cm', 'quintale', 'quintale x km', 'settimana', 't', 'watt picco']
  // dati prezziario Generale
  prezziarioGenerale = new PrezziarioGenerale();

  limit: number = 25;

  constructor(private _router: Router, private modalService: NgbModal, private serviziClientiservice: ServiziClienteService, private activatedRoute: ActivatedRoute, private _prezziarioGeneraleService: PrezziarioGeneraleService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    // Estraggo l'id dall'url
    const target = this.activatedRoute.snapshot.paramMap.get('id');
    this.idPrezziarioGenerale = Number.parseInt(target);
    // acquisisco i prezziari
    // DEVO SCARICARE IN REALTÆ SOLO IL PREZZIARIO SPECIFICO
    this.serviziClientiservice.getAllServiziCliente(this.idPrezziarioGenerale)
      .subscribe(
        (res) => {
          LoggingService.log('servizi clienti ottenuti relativi a questo prezziario generale', LogLevel.debug, res);
          this.servizicliente = res;
          this.tempData = res;
          this.servizicliente = [...this.servizicliente];

        },
        (err) => {
          LoggingService.log('errore nella get dei servizi clienti di questo prezziario', LogLevel.warn, err);
          // popup di errore
        },
        () => {
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-prezziario');
          tableRef.click();
        }
      );
    this._prezziarioGeneraleService.getPrezziarioGenerale(this.idPrezziarioGenerale).subscribe(
      (res) => {
        console.log('scaricati dati prezziario generale', res);
        this.prezziarioGenerale = res;
        document.getElementById('ngx-datatable-prezziario').click();
      },
      (err) => {
        console.error('ERRORE get dati prezziario generale', err);
      },
    )
  }



  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add mezzo', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {
      if (d.description != null && d.category != null) {
        return d.description.indexOf(val) !== -1 || d.category.indexOf(val) !== -1 || !val;
      }
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.servizicliente = temp;


  }
  // chiamata al click del tasto "Torna ai prezziari generali"
  navigateToPrezziariGenerali() {
    this._router.navigate(['/page/tables/prezziari-generali']);
  }
  // metodo utilizzato dal tasto "aggiungi mezzi" per aprire un popup
  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }
  // funzione chiamata quando si vuole modifica un servizio. Apre il popup con i dati già inseriti
  onEdit(target: ServizioCliente, modale) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    this.nuovoservizio = { ...target };
    // apro il popup
    this.openLg(modale);
  }
  // funzione chiamata quando si conferma la modifica di un servizio
  updateServizio() {
    this.serviziClientiservice.updateServizioCliente(this.nuovoservizio)
      .subscribe(
        (res) => {
          LoggingService.log('Update servizio cliente avvenuto con successo', LogLevel.debug, res);
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il prezzo è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          // pos contiene la posizione della nota da modificare
          const pos = this.servizicliente.indexOf(this.servizicliente.find(x => x.id == this.nuovoservizio.id));
          // sovrascrivo l'oggetto in posizione pos con la nuovaTsggedNota
          this.servizicliente[pos] = this.nuovoservizio;
          LoggingService.log('l\'elenco dei servizi dopo l\'update è diventato', LogLevel.debug, this.servizicliente);
          // aggiorno tempdata per il filtro di ricerca
          this.tempData = this.servizicliente;
          // ricarico la tabella
          this.servizicliente = [...this.servizicliente];
        },
        (err) => {
          LoggingService.log('ERRORE update servizio cliente', LogLevel.error, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il prezzo NON è stato modificato',
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
  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {
    this.selected = event.selected;
    LoggingService.log('selezionato', LogLevel.debug, event)
  }
  // metodo chiamato quando si fa l'upload di un file, ad esempio si carica un file excel
  addFile(event) {
    LoggingService.log('file caricato', LogLevel.debug, event);
    this.formData = new FormData();
    const files = event.target.files;
    LoggingService.log('filexxx', LogLevel.debug, files);
    // this.formData.append("formFiles", files);

    if (files) {
      // this.formData = new FormData();
      for (const file of files) {
        this.fileName = this.fileName.concat(file.name) + '; ';
        this.formData.append('formFile', file);
      }
    }
    LoggingService.log('formdata', LogLevel.debug, this.formData.getAll('formFile'));
    swal.fire({
      title: 'Sei sicuro di voler caricare i dati contenuti in questo file?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      cancelButtonText: 'Annulla',
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-info ml-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        this.spinner.show(undefined,
          {
            type: 'ball-triangle-path',
            size: 'medium',
            bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
            color: '#1898d6', // colore icona che si muove
            fullScreen: true
          });
        this.serviziClientiservice.postFile(this.idPrezziarioGenerale, this.formData).subscribe(
          (res) => {
            this.spinner.hide();
            swal.fire({
              icon: 'success',
              title: 'Fatto!',
              text: 'Il file è stato caricato. La pagina verrà ricaricata. Potrebbero essere necessari alcuni minuti prima che i servizi vengano visualizzati correttamente nel wizard di creazione del report.',
              customClass: {
                confirmButton: 'btn btn-success'
              },
            }).then(() => {
              location.reload();
            });
          },
          (err) => {
            this.spinner.hide();
            swal.fire({
              icon: 'error',
              title: 'C\'è stato un problema!',
              text: 'Il file non è stato caricato. Controlla l\'estensione',
              customClass: {
                confirmButton: 'btn btn-danger'
              }
            });
          },
          () => {
            this.fileName = '';
            this.formData = new FormData();
          },
        )
      }
    })
  }


  aggiungiServizioCliente() {
    LoggingService.log('nuovoservizio:', LogLevel.debug, this.nuovoservizio);
    this.nuovoservizio.idPrezziario = this.idPrezziarioGenerale;
    this.serviziClientiservice.postPrezziario(this.nuovoservizio)
      .subscribe(
        (res) => {
          this.nuovoservizio.id = res.id;
          LoggingService.log('nuovo prezziario postato con successo:', LogLevel.debug, res);
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
          LoggingService.log('errore post nuovo prezziario ', LogLevel.error, err);
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
          this.servizicliente.unshift(this.nuovoservizio);
          this.servizicliente = [... this.servizicliente];
          this.clearData();
          this.tempData = this.servizicliente;
        },
      )

  }
  clearData() {
    this.nuovoservizio = new ServizioCliente();
  }


  // funzione usata dall'ng-select nel form per le unità di misura
  addCustomUms = (term) => ({ name: term });

  // metodo usato per l'eliminazione di una o piu righe della tabella
  ConfirmText() {

    let str: string;
    let str2 = 'Elimina i servizi selezionati';
    let check = true;
    let text = 'L\'azione è irreversibile';
    if (this.selected.length == 0) {
      str = 'Nessun prezzo selezionato';
      str2 = '';
      check = false;
      text = '';
    } else if (this.selected.length == 1) {
      str = 'Vuoi eliminare il prezzo selezionato?';
    } else if (this.selected.length > 1) {
      str = 'Vuoi eliminare ' + this.selected.length + ' servizi?';
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
        LoggingService.log('array di servizi da eliminare', LogLevel.debug, this.checked)
        // eliminiamo le note selezionate
        this.serviziClientiservice.deletePrezziario(this.checked)
          .subscribe(
            (res) => {
              LoggingService.log('ho eliminato', LogLevel.debug, res)
              // rimuovo dall'array i servizi che ho eliminato e aggiorno la tabella
              for (let i = 0; i < this.checked.length; i++) {
                this.servizicliente.forEach(element => {
                  if (element.id == this.checked[i]) {
                    this.servizicliente.splice(this.servizicliente.indexOf(element), 1);
                  }
                });
              }
              this.servizicliente = [...this.servizicliente];
              // reinizializzo gli array legati alle checkbox
              this.checked = [];
              this.selected = [];
              this.tempData = this.servizicliente;
              swal.fire({
                icon: 'success',
                title: 'Fatto!',
                text: 'I servizi selezionati sono stati cancellati',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
              });
            },
            (err) => {
              swal.fire({
                icon: 'error',
                title: 'C\'è stato un problema!',
                text: 'I servizi selezionati NON sono stati cancellati',
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

  applyDiscountToSelected() {
    let str: string;
    let text = 'Vuoi applicare lo sconto ai servizi selezionati?';
    let check = true;
  
    if (this.selected.length == 0) {
      str = 'Nessun servizio selezionato';
      check = false;
      text = '';
    } else {
      str = 'Applica lo sconto a ' + this.selected.length + ' servizi?';
    }
  
    swal.fire({
      title: str,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      showConfirmButton: check,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      cancelButtonText: 'Annulla',
      confirmButtonText: 'Applica Sconto',
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-info ml-1'
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        // Imposta applyDiscount in true per ogni servizio selezionato
        this.selected.forEach(service => {
          const index = this.servizicliente.findIndex(s => s.id === service.id);
          if (index !== -1) {
            this.servizicliente[index].applyDiscount = true;
          }
        });
  
        // Aggiorna la tabella e le variabili di stato
        this.servizicliente = [...this.servizicliente];
        this.selected = [];
  
        swal.fire({
          icon: 'success',
          title: 'Fatto!',
          text: 'Sconto applicato ai servizi selezionati',
          customClass: {
            confirmButton: 'btn btn-success'
          },
        });
      }
    });
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

  calculateDiscountPrice(row: ServizioCliente): string {
    if (row.applyDiscount && this.prezziarioGenerale.discountPercentage) {
      let str = (row.pricePerUm - (row.pricePerUm / 100 * this.prezziarioGenerale.discountPercentage)).toFixed(2);
      return `€ ${str}`;
    }
    return "/";
  }
}
