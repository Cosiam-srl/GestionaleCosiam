import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ColumnMode} from '@swimlane/ngx-datatable';
import {HttpClient} from '@angular/common/http';
import {Cliente} from 'app/models/cliente.model';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ClientiService} from 'app/shared/services/data/clienti.service';
import {LoggingService, LogLevel} from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import {NgxSpinnerService} from 'ngx-spinner';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {PdfService} from '../../../shared/services/pdf.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomersComponent implements OnInit {
;
  // array che contiene tutto il personale esistente
  clienti: Cliente[];
  columnMode = ColumnMode;
  private tempData = [];

  // fornitore che si popolerà con le nuove informazioni inserite nel form
  nuovocliente = new Cliente();
  // variabile utilizzata per la validazione del form
  fff = false;
  // variabili usata quando viene aggiunto un file alla creazione di una cliente
  fileName = '';
  formData = new FormData();
  // variabile usata per il logo del cleinte, visualizzato all'inizio della dashboard
  imageSource: SafeResourceUrl;
  // variabile usata per il filtro della tipologia(pubblico o privato)
  filtroTipologia = '';
  // variabile usata per il filtro del pagamento
  filtroPagamento = '';

  limit: number = 25;

  tipologiepagamenti = [
    {name: '30 gg d.f.f.m'},
    {name: '60 gg d.f.f.m'},
    {name: '90 gg d.f.f.m'}
  ];
  formeGiuridiche = [
    {name: 'S.S.'},
    {name: 'S.N.C.'},
    {name: 'S.A.S'},
    {name: 'S.R.L.'},
    {name: 'S.P.A.'},
    {name: 'S.A.P.A.'},
  ];
  prov = [
    {name: 'AGRIGENTO (AG)'},
    {name: 'ALESSANDRIA (AL)'},
    {name: 'ANCONA (AN)'},
    {name: 'AOSTA (AO)'},
    {name: 'AREZZO (AR)'},
    {name: 'ASCOLI PICENO (AP)'},
    {name: 'ASTI (AT)'},
    {name: 'AVELLINO (AV)'},
    {name: 'BARI (BA)'},
    {name: 'BARLETTA-ANDRIA-TRANI (BT) '},
    {name: 'BELLUNO (BL)'},
    {name: 'BENEVENTO (BN) '},
    {name: 'BERGAMO (BG) '},
    {name: 'BIELLA (BI) '},
    {name: 'BOLOGNA (BO) '},
    {name: 'BOLZANO (BZ) '},
    {name: 'BRESCIA (BS) '},
    {name: 'BRINDISI (BR) '},
    {name: 'CAGLIARI (CA) '},
    {name: 'CALTANISSETTA (CL) '},
    {name: 'CAMPOBASSO (CB)'},
    {name: 'CARBONIA-IGLESIAS (CI)'},
    {name: 'CASERTA (CE)'},
    {name: 'CATANIA(CT) '},
    {name: 'CATANZARO (CZ)'},
    {name: 'CHIETI (CH)'},
    {name: 'COMO (CO)'},
    {name: 'COSENZA (CS)'},
    {name: 'CREMONA (CR)'},
    {name: 'CROTONE (KR)'},
    {name: 'CUNEO (CN)'},
    {name: 'ENNA (EN)'},
    {name: 'FERMO (FM)'},
    {name: 'FERRARA (FE)'},
    {name: 'FIRENZE (FI)'},
    {name: 'FOGGIA (FG)'},
    {name: 'FORLÌ-CESENA (FC)'},
    {name: 'FROSINONE (FR)'},
    {name: 'GENOVA (GE)'},
    {name: 'GORIZIA (GO)'},
    {name: 'GROSSETO (GR)'},
    {name: 'IMPERIA (IM)'},
    {name: 'ISERNIA (IS)'},
    {name: 'LA SPEZIA (SP)'},
    {name: 'L’AQUILA (AQ)'},
    {name: 'LATINA (LT)'},
    {name: 'LECCE (LE)'},
    {name: 'LECCO (LC)'},
    {name: 'LIVORNO (LI)'},
    {name: 'LODI (LO)'},
    {name: 'LUCCA (LU)'},
    {name: 'MACERATA (MC)'},
    {name: 'MANTOVA (MN)'},
    {name: 'MASSA-CARRARA (MS)'},
    {name: 'MATERA (MT)'},
    {name: 'MEDIO CAMPIDANO (VS)'},
    {name: 'MESSINA (ME)'},
    {name: 'MILANO (MI)'},
    {name: 'MODENA (MO)'},
    {name: 'MONZA E BRIANZA (MB)'},
    {name: 'NAPOLI (NA)'},
    {name: 'NOVARA (NO)'},
    {name: 'NUORO (NU)'},
    {name: 'OGLIASTRA (OG)'},
    {name: 'OLBIA-TEMPIO (OT)'},
    {name: 'ORISTANO (OR)'},
    {name: 'PADOVA (PD)'},
    {name: 'PALERMO (PA)'},
    {name: 'PARMA (PR)'},
    {name: 'PAVIA (PV)'},
    {name: 'PERUGIA (PG)'},
    {name: 'PESARO E URBINO (PU)'},
    {name: 'PESCARA (PE)'},
    {name: 'PIACENZA (PC)'},
    {name: 'PISA (PI)'},
    {name: 'PISTOIA (PT)'},
    {name: 'PORDENONE (PN)'},
    {name: 'POTENZA (PZ)'},
    {name: 'PRATO (PO)'},
    {name: 'RAGUSA (RG)'},
    {name: 'RAVENNA (RA)'},
    {name: 'REGGIO CALABRIA (RC)'},
    {name: 'REGGIO EMILIA (RE)'},
    {name: 'RIETI (RI)'},
    {name: 'RIMINI (RN)'},
    {name: 'Roma (RM)'},
    {name: 'ROVIGO (RO)'},
    {name: 'SALERNO (SA)'},
    {name: 'SASSARI (SS)'},
    {name: 'SAVONA (SV)'},
    {name: 'SIENA (SI)'},
    {name: 'SIRACUSA (SR)'},
    {name: 'SONDRIO (SO)'},
    {name: 'TARANTO (TA)'},
    {name: 'TERAMO (TE)'},
    {name: 'TERNI (TR)'},
    {name: 'TORINO (TO)'},
    {name: 'TRAPANI (TP)'},
    {name: 'TRENTO (TN)'},
    {name: 'TREVISO (TV)'},
    {name: 'TRIESTE (TS)'},
    {name: 'UDINE (UD)'},
    {name: 'VARESE (VA)'},
    {name: 'VENEZIA (VE)'},
    {name: 'VERBANO-CUSIO-OSSOLA (VB)'},
    {name: 'VERCELLI (VC)'},
    {name: 'VERONA (VR)'},
    {name: 'VIBO VALENTIA (VV)'},
    {name: 'VICENZA (VI)'},
    {name: 'VITERBO (VT)'},
  ]

  constructor(private _spinner: NgxSpinnerService, private cdRef: ChangeDetectorRef, private pdf: PdfService, private sanitizer: DomSanitizer, private spinner: NgxSpinnerService, private http: HttpClient, private router: Router, private modalService: NgbModal, private clientiservice: ClientiService) {
  }

  ngOnInit() {
    registerLocaleData(localeIt, 'it');

    // Riscrivo le province col capolettera maiuscolo e le altre lettere in minuscolo
    this.prov.forEach(prov => {
      prov.name = prov.name.toLowerCase();
      for (let i = 0; i < prov.name.length; i++) {
        // per le province che hanno dei trattini, la lettera dopo i trattini diventa maiuscola
        if (prov.name.charAt(i) == '-' || prov.name.charAt(i) == ' ') {
          prov.name = prov.name.slice(0, i + 1) + prov.name.charAt(i + 1).toUpperCase() + prov.name.slice(i + 2);
        }
        // dopo la parentesi tonda le lettere sono tutte maiuscole
        if (prov.name.charAt(i) == '(') {
          prov.name = prov.name.slice(0, i) + prov.name.slice(i).toUpperCase();
          continue
        }
      }
      prov.name = prov.name.charAt(0).toUpperCase() + prov.name.slice(1);
    });

    this.clientiservice.getAllClienti()
      .subscribe(
        (res) => {
          this.clienti = res;
          LoggingService.log('clienti ottenuti', LogLevel.debug, this.clienti)
        },
        (err) => {
          LoggingService.log('errore get clienti', LogLevel.debug, err)
        },
        () => {
          this.tempData = this.clienti;
          // genero un click
          const tableRef = document.getElementById('ngx-datatable-customers');
          tableRef.click();
        }
      )
  }

  // funzione chiamata per navigare dentro la dashboard del cliente
  onEdit(target: Cliente) {
    LoggingService.log('richiesta modifica per', LogLevel.debug, target);
    // Navigo verso la dashboard di quel cliente
    this.router.navigate(['/page/dashboards/clienti/', target.id]);
  }

  // funzione chiamata al click del bottone modifica sulla riga della tabella
  onModify(modale, cliente: Cliente) {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    setTimeout(() => {

      this.clientiservice.getCliente(cliente.id)
        .subscribe(
          (res) => {
            LoggingService.log('cliente da modificare scaricato', LogLevel.debug, res);
            this.nuovocliente = res;
          },
          (err) => {
            LoggingService.log('ERRORE get cliente da modificare', LogLevel.error, err);
          },
          () => {
            this.modalService.open(modale, {size: 'xl'});
            this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(this.nuovocliente.file as string);
            this.spinner.hide();
          },
        )
    }, 500);
  }

  openLg(content) {
    this.modalService.open(content, {size: 'xl'});
  }

  // funzione che raccoglie alcuni input inseriti nel form di crea cantiere
  addDatiPersonale(event) {
    const target = event.target.value;
    const placeholder = event.target.attributes.placeholder.nodeValue;
    // LoggingService.log('dato nota inserito', LogLevel.debug,event);

    if (placeholder.toLowerCase() == 'nome') {
      // LoggingService.log('indirizzo cantiere nuovo', LogLevel.debug, target)
      this.nuovocliente.name = target;
      // LoggingService.log('nuovanota', LogLevel.debug,this.nuovanota);
    }
  }

  creaCliente() {
    LoggingService.log('il nuovocliente è', LogLevel.debug, this.nuovocliente);
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.clientiservice.postCliente(this.nuovocliente)
      .subscribe(
        (res) => {
          LoggingService.log('nuovopersonale postato con successo', LogLevel.debug, res);
          this.nuovocliente.id = res.id;
          this.spinner.hide();
          swal.fire({
            title: 'Cliente Creato!',
            text: 'Il cliente è stato aggiunto nella tabella',
            icon: 'success',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false,
            confirmButtonText: '<i class="fa fa-thumbs-o-up"></i> OK!'
          });
        },
        (err) => {
          LoggingService.log('ERRORE post nuovocliente', LogLevel.debug, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il cliente NON è stato creato.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        },
        () => {
          this.clienti.unshift(this.nuovocliente);
          this.clienti = [...this.clienti];
          this.clearData();
          this.formData = new FormData();
          this.tempData = [...this.clienti];

        }
      )

  }

  // filtro cerca
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro', LogLevel.debug, event.target.value.toLowerCase())

    const temp = this.tempData.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.clienti = temp;

  }

  // funzione chiamata quando si filtra il pagamento o la tipologia
  filtro() {
    const type = this.filtroTipologia;
    const payment = this.filtroPagamento;
    LoggingService.log('pagamento e tipologia sono', LogLevel.debug, [payment, type]);

    const temp = this.tempData.filter(function (d) {

      if (type == '' && payment == '') {
        return d// ritorno tutti gli elementi perchè equivale a non filtrare
      }
      if (type == '' && payment != '') {
        if (d.payments != null) {
          return d.payments.indexOf(payment) !== -1 || !payment;
        }
        return
      }
      if (payment == '' && type != '') {
        if (d.type != null) {
          return d.type.indexOf(type) !== -1 || !type;
        }
        return;
      } else {
        if (d.type != null && d.payments != null) {
          return d.payments.indexOf(payment) !== -1 && d.type.indexOf(type) !== -1 || !type || !payment;
        }
        return
      }
    });

    // update the rows
    this.clienti = temp;
  }

  pulisciFiltri() {
    this.filtroPagamento = '';
    this.filtroTipologia = '';
  }

  clearData() {
    this.nuovocliente = new Cliente();
    this.fff = false;
    this.fileName = '';
    delete this.imageSource;
    LoggingService.log('imagesource è', LogLevel.debug, this.imageSource);
  }

  // funzione chiamata quando nel form di creazione viene aggiunto un allegato(una foto)
  addImageToCliente(event) {
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
      this.deleteImageCliente();
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
      this.deleteImageCliente();
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.nuovocliente.file = reader.result;
    };
    this.fff = true;
  }  // funzione chiamata quando nel form di creazione si eliminano gli allegati aggiunti
  deleteImageCliente() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }

  // chiamata quando si vuol rimuovere il logo senza sovrascriverlo con un altro
  removeLogoCliente() {
    this.nuovocliente.file = null;
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

  updateCliente() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.clientiservice.updateCliente(this.nuovocliente)
      .subscribe(
        (res) => {
          LoggingService.log('ok update andato', LogLevel.debug, res);
          this.spinner.hide();
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il cliente è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          // pos contiene la posizione del servizio da modificare
          const pos = this.clienti.indexOf(this.clienti.find(x => x.id == this.nuovocliente.id));
          // sovrascrivo l'oggetto in posizione pos con il nuovoservizio
          this.clienti[pos] = this.nuovocliente;
          this.tempData = this.clienti;
          // ricarico la tabella
          this.clienti = [...this.clienti];
        },
        (err) => {
          LoggingService.log('errore update', LogLevel.debug, err);
          this.spinner.hide();
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il cliente NON è stato modificato',
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

  deleteCliente(event) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il cliente selezionato';
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
            this.clientiservice.deleteCliente(event.id)
              .subscribe(
                (res) => {
                  LoggingService.log('cliente eliminato con statuscode:', LogLevel.debug, res.status);
                  swal.fire({
                    icon: 'success',
                    title: 'Fatto!',
                    text: 'Il cliente selezionato è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-success'
                    },
                  });
                },
                (err) => {
                  LoggingService.log('errore eliminazione cliente', LogLevel.debug, err);
                  swal.fire({
                    icon: 'error',
                    title: 'C\'è stato un problema!',
                    text: 'Il cliente selezionato NON è stato cancellato',
                    customClass: {
                      confirmButton: 'btn btn-danger'
                    }
                  });
                },
                () => {
                  this.clienti.splice(
                    this.clienti.indexOf(
                      this.clienti.find(x => x.id == event.id)
                    ),
                    1
                  );
                  // ricarico la tabella
                  this.clienti = [...this.clienti];
                  this.tempData = this.clienti;
                }
              )
          }

        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  // funzione usata dall'ng-select nel form per le modalità di pagamento
  addCustom = (term) => ({id: term, name: term});

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

    if (this.clienti.length > this.limit) {

      let l = this.limit
      this.limit = this.clienti.length
      setTimeout(() => {
        this.pdf.downloadPDF('ngx-datatable-customers', `clienti`, () => {
          this.limit = l;
          this.cdRef.detectChanges()
        }, this._spinner)
      })
    } else {
      this.pdf.downloadPDF('ngx-datatable-customers', `clienti`, null, this._spinner)
    }

  }

}
