import { DatePipe, registerLocaleData } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EstrazioneDatiPersonaleMezziModel, Personale, ScadenzePersonale } from 'app/models/personale.model';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import swal from 'sweetalert2';
import localeIt from '@angular/common/locales/it';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { Cantiere } from 'app/models/cantiere.model';
import { forkJoin, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import { AuthService } from 'app/shared/auth/auth.service';
import { HttpResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-personale-dashboard',
  templateUrl: './personale-dashboard.component.html',
  styleUrls: ['./personale-dashboard.component.scss', '../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PersonaleDashboardComponent implements OnInit {
  // attributo per le tabs
  active = 1;
  idPersonale: number;
  //usato solo per tenere salvati i dati iniziali del personale
  personale: Personale = new Personale();
  //utilizzato per il form di modifica e per la dashboard stessa
  nuovopersonale: Personale = new Personale();
  // variabili usata quando viene aggiunto un file alla creazione di una cliente
  fileName = '';
  formData = new FormData();
  // variabile usata per il logo del cleinte, visualizzato all'inizio della dashboard
  imageSource: SafeResourceUrl;
  // variabile che contiene la lista dei cantieri in cui questa persona è attualmente occupata(NON CONTIENE I CANTIERI TERMINATI)
  cantieriPersonale: Cantiere[] = [];
  // variabile che contiene tutte le scadenze insieme
  scadenzePersonale30: ScadenzePersonale[];
  scadenzePersonale15: ScadenzePersonale[];
  scadenzePersonale0: ScadenzePersonale[];
  // array utilizzati nella modifica del personale
  titoli = ['Sig.', 'Sig.Ra', 'Ing.', 'Geom.', 'Arch.', 'Dott.'];
  contratti = ['Tempo determinato', 'Tempo indeterminato', 'CO.CO.CO', 'Apprendistato', 'Somministrazione', 'Prestazione Occasionale', 'Prestazione d\'opera', 'Tirocinio', 'Distacco'];
  ruoliOrganigramma = ['Impiegato tecnico', 'Operaio', 'Responsabile HSE', 'Magazzino', 'DL/DT', 'AMM', 'DT', 'ACOM'];
  datax = '2013-04-22'

  skills = [];

  // variabili usate per la card ore lavorate
  oreOrdinarie = 0;
  oreStraordinarie = 0;
  oreSpostamento = 0;

  dataInizioOreLavorate: string;
  dataFineOreLavorate: string;

  //utilizzato per abilitare o disabilitare il tasto di conferma modifica nel form
  disableConfirmButton: boolean = false;

  estraiDatiModel = new EstrazioneDatiPersonaleMezziModel()

  constructor(private _sanitizer: DomSanitizer,
    private _spinner: NgxSpinnerService,
    private router: ActivatedRoute,
    private modalService: NgbModal,
    private personaleservice: PersonaleService,
    private authService: AuthService) {

  }
  test() {
    LoggingService.log('data', LogLevel.debug, this.datax);
  }
  ngOnInit(): void {
    this.idPersonale = Number.parseInt(this.router.snapshot.paramMap.get('id') ?? '0');
    registerLocaleData(localeIt, 'it-IT');
    // this._spinner.show(undefined,
    //   {
    //     type: 'ball-triangle-path',
    //     size: 'medium',
    //     bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
    //     color: '#1898d6', // colore icona che si muove
    //     fullScreen: true
    //   });
    this.personaleservice.getPersonale(this.idPersonale)
      .subscribe(
        (res) => {
          LoggingService.log('persona estratta', LogLevel.debug, res);
          this.personale = { ...res };
          this.nuovopersonale = res;
        },
        (err) => {
          LoggingService.log('errore persona estratta', LogLevel.debug, err);
          this._spinner.hide();
        },
        () => {
          this.nuovopersonale.fullName = this.nuovopersonale.name + ' ' + this.nuovopersonale.surname;
          document.getElementById('cards').click();
          this.imageSource = this._sanitizer.bypassSecurityTrustResourceUrl(this.nuovopersonale.file as string);
          // estrapolo le skills
          let sk = '';
          for (let i = 0; i < this.nuovopersonale.skills.length; i++) {
            if (this.nuovopersonale.skills[i] != '$') {
              sk = sk.concat(this.nuovopersonale.skills[i]);
            } else {
              this.skills.push(sk);
              sk = '';
            }
          }
          this._spinner.hide();
          LoggingService.log('skills è', LogLevel.debug, this.skills);

        }
      )

    this.personaleservice.getCantieriPersonale(this.idPersonale)
      .subscribe(
        (res) => {
          LoggingService.log('cantieri in cui lavora estratti', LogLevel.debug, res);
          this.cantieriPersonale = res;
        },
        (err) => {
          LoggingService.log('ERRORE get cantieri in cui lavora ', LogLevel.error, err);
          this._spinner.hide();
        },
        () => {
          // elimino dalla lista i cantieri che sono terminati
          const cantieriCorretti: Cantiere[] = [];
          this.cantieriPersonale.forEach(cantiere => {
            if (cantiere.state != 'Terminato') {

              // non inserisco dei duplicati nel caso la persona fosse stata inserita più volte in un cantiere magari con date di assegnamento diverse
              const index = cantieriCorretti.findIndex(e => e.id == cantiere.id);
              if (index == -1) {
                cantieriCorretti.push(cantiere);
              }
            }
          });
          this.cantieriPersonale = cantieriCorretti;
          this.cantieriPersonale = [...this.cantieriPersonale];
          // this.cantieriPersonale = cantieriCorretti;
          LoggingService.log('cantieri in cui lavora', LogLevel.debug, this.cantieriPersonale);
        }
      )
    // escludo dalle scadenze imminenti quelle con stato Chiuso(mettendo a false il secondo parametro)
    this.personaleservice.getScadenzePersonaleFiltered(this.idPersonale, false, null, 30)
      .subscribe(
        (res: ScadenzePersonale[]) => {
          LoggingService.log('Scadenze filtrate 30 giorni ottenute', LogLevel.debug, res);
          this.scadenzePersonale30 = res;

        },
        (err) => {
          LoggingService.log('ERRORE get scadenze filtrate 30 giorni', LogLevel.error, err);
          this._spinner.hide();
        },
        () => {

        }
      )
    // escludo dalle scadenze imminenti quelle con stato Chiuso(mettendo a false il secondo parametro)
    this.personaleservice.getScadenzePersonaleFiltered(this.idPersonale, false, null, 15)
      .subscribe(
        (res: ScadenzePersonale[]) => {
          LoggingService.log('Scadenze filtrate 15 giorni ottenute', LogLevel.debug, res);
          this.scadenzePersonale15 = res;
        },
        (err) => {
          LoggingService.log('ERRORE get scadenze filtrate 15 giorni', LogLevel.error, err);
          this._spinner.hide();
        },
        () => { }
      )
    // escludo dalle scadenze imminenti quelle con stato Chiuso(mettendo a false il secondo parametro)
    this.personaleservice.getScadenzePersonaleFiltered(this.idPersonale, false, null, 0)
      .subscribe(
        (res: ScadenzePersonale[]) => {
          LoggingService.log('Scadenze filtrate 0 giorni ottenute', LogLevel.debug, res);
          this.scadenzePersonale0 = res;
        },
        (err) => {
          LoggingService.log('ERRORE get scadenze filtrate 0 giorni', LogLevel.error, err);
          this._spinner.hide();
        },
        () => { }
      )

    // una volta ottenute le scadenze posso filtrare
    const idIntervallo = setInterval(() => {
      if (this.scadenzePersonale0 != null && this.scadenzePersonale15 != null && this.scadenzePersonale30 != null) {
        clearInterval(idIntervallo); // stoppo il setInterval
        if (this.scadenzePersonale30.length == 0) {
          document.getElementById('cardScadenze').click();
          return;
        }
        this.filterscadenze();
      }
    }, 100);

    this.personaleservice.getTimeCardsPersonale(this.idPersonale).subscribe(
      (res) => {
        // TODO: Verificare logica
        if (!res || res.length < 1) //res.length < 3
          return;
        console.log('timeCards personale scaricate', res);
        this.oreOrdinarie = res[0].numberOfHours
        this.oreStraordinarie = res[1].numberOfHours
        this.oreSpostamento = res[2].numberOfHours
      },
      (err) => {
        console.error('ERRORE get timeCards personale ', err)
      },
    )

  }
  // chiamata una volta scaricate le scadenze
  filterscadenze() {
    console.log('sto filtrando');

    // tolgo dalle scadenze30 le scadenze 15
    let scad = [];
    for (const x of this.scadenzePersonale30) {
      const flag = this.scadenzePersonale15.find(y => y.id == x.id);
      if (flag == undefined) {
        scad.push(x);
      }
    }
    this.scadenzePersonale30 = [...scad];
    scad = [];
    // tolgo dalle scadenze15 le scadenze 0
    for (const x of this.scadenzePersonale15) {
      const flag = this.scadenzePersonale0.find(y => y.id == x.id);
      if (flag == undefined) {
        scad.push(x);
      }
    }
    this.scadenzePersonale15 = [...scad];


    console.log('ce l\'abbiamo fatta', [this.scadenzePersonale0, this.scadenzePersonale15, this.scadenzePersonale30]);
    document.getElementById('cardScadenze').click();

  }

  // metodo utilizzato per aprire un popup di modifica
  openLg(content) {
    this.modalService.open(content, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });

  }

  onEdit(modale) {
    // LoggingService.log("richiesta modifica per amministrazione personale", LogLevel.debug, target);
    // this.nuovopersonale = { ...target };
    // apro il popup
    this.openLg(modale);
  }
  // funzione utilizzata dal datepicker
  cambia(event, binding: string) {
    LoggingService.log('cambia è', LogLevel.debug, event);

    const millisec = Date.now();
    const date = new Date(millisec);
    const ore = Number.parseInt(date.toTimeString().substring(0, 2));
    const minuti = Number.parseInt(date.toTimeString().substring(3, 5));
    const secondi = Number.parseInt(date.toTimeString().substring(6, 8));
    switch (binding) {
      case 'datanascita': {
        if (event.year == null && event.month == null && event.day == null) {
          this.nuovopersonale.birthday = null;
          return
        }
        if (event.month != 9 && event.month != 10 && event.month != 11 && event.month != 12) {
          this.nuovopersonale.birthday = event.year + '/' + '0' + (event.month + 1).toString() + '/' + event.day;
        } else {
          this.nuovopersonale.birthday = event.year + '/' + (event.month + 1).toString() + '/' + event.day;
        }
        LoggingService.log('la data di nascita modificata è', LogLevel.debug, this.nuovopersonale.birthday);
        break;
      }
      case 'dataAssunzione': {

        LoggingService.log('la data di assunzione è', LogLevel.debug, event);
        break;
      }
      case 'scadenzaAssunzione': {
        LoggingService.log('la data di scadenza assunzione è', LogLevel.debug, event);
        break;
      }
      case 'idoneitaSanitaria': {
        LoggingService.log('la data di Idoneità sanitaria hse è', LogLevel.debug, event);
        break;
      }
      case 'orelavoratedatainizio': {
        LoggingService.log('la data di inizio ore lavorate è', LogLevel.debug, event);
        if (event.year == null && event.month == null && event.day == null) {
          this.dataInizioOreLavorate = null;
          this.getOreLavorate(this.dataInizioOreLavorate, this.dataFineOreLavorate);
          return
        }

        const data = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        this.dataInizioOreLavorate = data.toISOString().substring(0, 10);
        this.getOreLavorate(this.dataInizioOreLavorate, this.dataFineOreLavorate);
        break;
      }
      case 'orelavoratedatafine': {
        if (event.year == null && event.month == null && event.day == null) {
          this.dataFineOreLavorate = null;
          this.getOreLavorate(this.dataInizioOreLavorate, this.dataFineOreLavorate);
          return
        }
        LoggingService.log('la data di fine ore lavorate è', LogLevel.debug, event);
        const data = new Date(event.year, event.month, event.day, ore, minuti, secondi);
        console.log(data);
        this.dataFineOreLavorate = data.toISOString().substring(0, 10);
        this.getOreLavorate(this.dataInizioOreLavorate, this.dataFineOreLavorate);
        break;
      }
      default: {
        LoggingService.log('problemino col datepicker', LogLevel.debug, event);
        // statements;
        break;
      }
    }
  }
  // chiamata quando si usa la card delle ore lavorate
  getOreLavorate(dataInizio: string, datafine: string, button?: string) {
    if (button) {
      switch (button) {
        case 'mese': {
          const date = new Date();
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString();
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString();

          this.dataInizioOreLavorate = firstDay.split('/')[2] + '-' + firstDay.split('/')[1] + '-' + firstDay.split('/')[0];
          this.dataFineOreLavorate = lastDay.split('/')[2] + '-' + lastDay.split('/')[1] + '-' + lastDay.split('/')[0];
          console.log(this.dataInizioOreLavorate, this.dataFineOreLavorate);

          break;
        }
        case 'giorno': {
          const date = new Date();
          console.log(date)
          const firstDay = date.toLocaleDateString();
          this.dataInizioOreLavorate = firstDay.split('/')[2] + '-' + firstDay.split('/')[1] + '-' + firstDay.split('/')[0];
          this.dataFineOreLavorate = this.dataInizioOreLavorate;
          console.log(this.dataInizioOreLavorate, this.dataFineOreLavorate);

          break;
        }
        case 'settimana': {
          const date = new Date();

          const firstDay = moment().startOf('week').toDate().toLocaleDateString();
          const lastDay = moment().endOf('week').toDate().toLocaleDateString();

          this.dataInizioOreLavorate = firstDay.split('/')[2] + '-' + firstDay.split('/')[1] + '-' + firstDay.split('/')[0];
          this.dataFineOreLavorate = lastDay.split('/')[2] + '-' + lastDay.split('/')[1] + '-' + lastDay.split('/')[0];
          console.log(this.dataInizioOreLavorate, this.dataFineOreLavorate);
          break;
        }

        default:
          break;
      }
    }

    if (!dataInizio && !button) {
      this.dataInizioOreLavorate = '';
    }
    if (!datafine && !button) {
      this.dataFineOreLavorate = '';
    }

    if ((this.dataInizioOreLavorate.split('-')[2]).length == 1) {
      this.dataInizioOreLavorate = this.dataInizioOreLavorate.substring(0, 8) + '0' + this.dataInizioOreLavorate.substring(8, 10);
    }
    if ((this.dataFineOreLavorate.split('-')[2]).length == 1) {
      this.dataFineOreLavorate = this.dataFineOreLavorate.substring(0, 8) + '0' + this.dataFineOreLavorate.substring(8, 10);
    }
    console.log(this.dataInizioOreLavorate, this.dataFineOreLavorate);

    this.personaleservice.getTimeCardsPersonale(this.idPersonale, this.dataInizioOreLavorate, this.dataFineOreLavorate).subscribe(
      (res) => {
        console.log('timeCards personale scaricate', res);
        if (res.length == 0) {
          this.oreOrdinarie = 0;
          this.oreStraordinarie = 0;
          this.oreSpostamento = 0;

        } else {

          this.oreOrdinarie = res[0].numberOfHours;
          this.oreStraordinarie = res[1].numberOfHours;
          this.oreSpostamento = res[2].numberOfHours;
        }

        document.getElementById('orelavorate').click();
      },
      (err) => {
        console.error('ERRORE get timeCards personale ', err)
      },
    )
  }
  // funzione chiamata quando si vuol chiudere il popup di modifica, senza quindi effetivamente aver modificato il personale
  restoreData() {
    this.personaleservice.getPersonale(this.idPersonale)
      .subscribe(
        (res) => {
          LoggingService.log('persona riestratta', LogLevel.debug, res);
          this.personale = { ...res };
          this.nuovopersonale = res;
        },
        (err) => {
          LoggingService.log('errore riestrazione persona', LogLevel.debug, err);
        },
        () => {
          this.nuovopersonale.fullName = this.nuovopersonale.name + ' ' + this.nuovopersonale.surname;
          document.getElementById('cards').click();
        },
      )
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
    if (file.size > 2000000) {
      swal.fire({
        icon: 'error',
        title: 'C\'è stato un problema!',
        text: 'Il file caricato supera le dimensioni di 2MB. Riprova con uno piu leggero.',
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
  };
  // funzione chiamata quando nel form di creazione si eliminano gli allegati aggiunti
  deleteImagePersonale() {
    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza
    (document.getElementById('inputGroupFile01') as HTMLInputElement).value = null;

    this.fileName = '';
    this.formData = new FormData();
  }
  removeLogoPersonale() {
    this.nuovopersonale.file = null;
    swal.fire({
      icon: 'warning',
      title: 'Importante!',
      text: 'Il logo verrà rimosso solo se confermi le modifiche. Se non lo fai, al ricaricamento della pagina troverai il logo precedente',
      customClass: {
        confirmButton: 'btn btn-success'
      },
    });
  }
  updatePersonale() {
    this.nuovopersonale.cf = this.nuovopersonale.cf.toUpperCase();
    this.nuovopersonale.skills = '';

    this.skills.forEach(element => {
      LoggingService.log('la skill è', LogLevel.debug, element);
      this.nuovopersonale.skills = this.nuovopersonale.skills.concat(element + '$')
    });
    this._spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    LoggingService.log('personale che sto per aggiornare', LogLevel.debug, this.nuovopersonale);

    //se non è abilitato ad essere un utente, elimino il ruolo
    if (!this.nuovopersonale.canLogin)
      this.nuovopersonale.role = null;

    //se è abilitato ad essere un utente, se non è stato selezionato un ruolo, lo imposto di default a 'foreman'
    else if (this.nuovopersonale.canLogin && (!this.nuovopersonale.role || this.nuovopersonale.role == ''))
      this.nuovopersonale.role = 'Foreman';

    this.personaleservice.updatePersonale(this.nuovopersonale, this.nuovopersonale.canLogin)
      .subscribe(
        (res) => {
          LoggingService.log('update personale riuscito!', LogLevel.debug, res);
          this.personale = { ...res };
          this.nuovopersonale = res;
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Il personale è stato modificato',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          });
          this.disableConfirmButton = false;
        },
        (err) => {
          LoggingService.log('errore update personale', LogLevel.error, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'Il personale NON è stato modificato.La pagina verrà ricaricata',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          }).then(() => { location.reload() });
          this._spinner.hide();
        },
        () => {

          this.personaleservice.getPersonale(this.idPersonale)
            .subscribe(
              (res) => {
                LoggingService.log('persona estratta', LogLevel.debug, res);
                this.personale = { ...res };
                this.nuovopersonale = res;
              },
              (err) => {
                LoggingService.log('errore persona estratta', LogLevel.debug, err);
              },
              () => {
                this.nuovopersonale.fullName = this.nuovopersonale.name + ' ' + this.nuovopersonale.surname;
                this.imageSource = this._sanitizer.bypassSecurityTrustResourceUrl(this.nuovopersonale.file as string);
                this._spinner.hide();
              },
            )
        },
      )
  }
  // funzione usata dall'ng-select nel form per le skill
  addCustomUser = (term) => ({ id: term, name: term });

  //utilizzata per controllare che la mail inserita non sia già presente
  checkEmail() {
    //se ha inserito la stessa email di prima, non fa nulla
    if (this.personale.email === this.nuovopersonale.email) {
      this.disableConfirmButton = false;
      return;
    }

    this.personaleservice.emailExists(this.nuovopersonale.email)
      .subscribe(
        (res) => {
          LoggingService.log('email esistente', LogLevel.debug, res);
          if (res)
            this.disableConfirmButton = true;
          else
            this.disableConfirmButton = false;
        },
        (err) => {
          LoggingService.log('ERRORE GET EMAIL', LogLevel.error, err);
          this.disableConfirmButton = false;
        },
        () => {
          LoggingService.log('email non esistente', LogLevel.debug, 'completato');
        },
      )
  }

  resendResetEmail() {
    this.authService.forgotPassword({ username: this.personale.email })
      .subscribe(
        (res) => {
          if (res.ok) {
            LoggingService.log('Email di reset inviata correttamente');
            swal.fire({
              icon: 'success',
              title: 'Mail di reset inviata correttamente',
              text: 'Inviata alla email del personale: ' + this.personale.email,
              customClass: {
                confirmButton: 'btn btn-success'
              },
            });
          }
        },
        (err) => {
          LoggingService.log('errore update personale', LogLevel.error, err);
          swal.fire({
            icon: 'error',
            title: 'C\'è stato un problema!',
            text: 'L\'email di reset NON è stata inviata.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        }
      )
  }

  estraiDettagli(exportType: 'pdf' | 'xlsx') {
    this._spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.personaleservice.estraiDatiPersonale([this.idPersonale], exportType, this.estraiDatiModel.dateFrom, this.estraiDatiModel.dateTo)
      .subscribe(
        (res: HttpResponse<any>) => {

          if (res.status == HttpStatusCode.NoContent) {
            swal.fire({
              icon: 'info',
              title: 'Nessun dato presente',
              text: "Non ci sono dati da estrapolare",
              customClass: {
                confirmButton: 'btn btn-danger'
              }
            });
            this._spinner.hide()
            return;
          }
          let fileType = exportType=='xlsx'? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'application/pdf';
          let fileName = `Estrazione Personale.${exportType}`;

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
            text: "",
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          });
        })
  }

  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }
  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('resize', true, false);
    window.dispatchEvent(evt);
  };
}

