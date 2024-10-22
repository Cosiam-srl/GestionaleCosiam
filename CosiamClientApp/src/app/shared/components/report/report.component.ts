import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

import { CantieriService } from 'app/shared/services/data/cantieri.service';
import { LoggingService, LogLevel } from 'app/shared/services/logging/logging.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { ListaMezziDiCantiere } from 'app/models/listaMezziDiCantiere.model';

import { ServizioCliente, ServizioFornitore } from 'app/models/benieservizi.model';
import { SupplierService } from 'app/shared/services/data/supplier.service';
import { Supplier } from 'app/models/supplier.model';
import { NgSelectComponent, NgSelectConfig } from '@ng-select/ng-select';
import { ServiziClienteService } from 'app/shared/services/data/servizicliente.service';
import { Cantiere } from 'app/models/cantiere.model';
import { ContrattoService } from 'app/shared/services/data/contratti.service';
import { Contratto } from 'app/models/contratto.model';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { _File } from 'app/models/file.model';
import { Personale } from 'app/models/personale.model';
import { Mezzo } from 'app/models/mezzo.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { DataPipe } from 'app/shared/pipes/date.pipe';
import { AppConfigService } from 'app/shared/services/configs/app-config.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FileService } from 'app/shared/services/data/file.service';
import { MezziService } from 'app/shared/services/data/mezzi.service';
import { PersonaleService } from 'app/shared/services/data/personale.service';
import { DatePipe } from '@angular/common';

import { MenuItem } from 'primeng/api';
import { SystemParametersService } from 'app/shared/services/configs/system-parameters.service';
import { PdfService } from '../../services/pdf.service';

export class PersonaleReportModel {
  employees: Personale[];
  extraordinaryCost: number[];
  extraordinaryHours: string[];
  hours: string[];
  ordinaryCost: number[];
  totalCost: number[];
  travelHours: string[];
  travelHoursCost: number[];
  absenceHours: string[];
  absenceReasons: string[];
}

export class VehiclesReportModel {
  vehicles: ListaMezziDiCantiere[];
  liters: string[];
  costPerLiter: string[];
  dailyPrice: number[];
  fuelTotalPrice: number[];
  totalPrice: number[];
}

export class LavoriEseguitiReportModel {
  activities: string[];
  prezziario: ServizioCliente[];
  quantities: string[];
  equalParts: number[];
  lengths: number[];
  widths: number[];
  heights: number[];
  ums: string[];
  unitaryPrices: number[];
  category: string[];
  totalPrice: number[];
}

export class ProvvisteReportModel {
  descriptions: ServizioFornitore[];
  suppliers: Supplier[];
  quantities: string[];
  ums: string[];
  unitaryPrices: number[];
  totalPrice: number[];
}

export class AllegatiEQuestionarioReportModel {
  meteo: string;
  mezzi: string;
  fornitori: string;
  risorseUmane: string;
  commentiMeteo: string;
  commentiAttrezzatureMezzi: string;
  commentiFornitori: string;
  commentiRisorseUmane: string;
  commenti: string;
}

export class ReportModel {
  personale: PersonaleReportModel;
  mezzi: VehiclesReportModel;
  lavoriEseguiti: LavoriEseguitiReportModel
  provviste: ProvvisteReportModel;
  allegatiEQuestionario: AllegatiEQuestionarioReportModel;
  signature?: string;
  author: string;
  referenceDate: string; // data di riferimento report nell'ultimo step
  status: ReportStatus = ReportStatus.ToBeApproved;
  counter: number;
  approvalAuthor?: string;
  approvalDate: Date;
}

export class reportShortModel {
  author: string;
  date: Date;
  id: number;
  idCantiere: number;
  jObject?: string;
  sign?: string;
  referenceDate: string; // data di riferimento report nell'ultimo step
  referenceDateAsDate?: Date;
  status: ReportStatus = ReportStatus.ToBeApproved;
  costi: number;
  ricavi: number;
  margine: number;

  // aggiunti solo sul frontend
  allegatiLavoriEseguiti: _File[];
  allegatiProvviste: _File[];
  allegatiDomande: _File[];
  foto: _File[];
}

enum ReportStatus {
  Draft = 0,
  ToBeApproved = 1,
  Approved = 2
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],

  // al ridimensionamento dello schermo emette l'evento
  host: {
    '(window:resize)': 'onScreenResize($event)'
  },

})
export class ReportComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  pageSize = 5;

  public reportStatus = ReportStatus;
  /**
   * abilita o disabilita il tasto per approvare un report
   */
  canApproveReport = false;

  // usata per il posizionamento della barra degli step nel report
  // se stringa vuota allora la barra scompare
  navBarLocation = 'top'

  // variabile che contiene il numero di cantiere
  @Input() targetCantiereId: number;
  // Data inizio cantiere
  @Input() targetDataInizioCantiere: number;
  // variabile utilizzata per far aprire in automatico il report
  @Input() openReport;
  // variabile necessaria per l'ngx-datatable
  columnMode = ColumnMode;
  // array per il filtro di ricerca
  private tempData = [];
  // altra variabile per le checkbox
  public SelectionType = SelectionType;

  // user = this._auth.whoAmI().username;
  user: string;

  startDateAggrega: string;
  endDateAggrega: string;
  mostraCosti: boolean;
  mostraRicavi: boolean;
  mostraFoto: boolean;
  reportCompleto: boolean;
  idReport: number;
  @ViewChild('aggregaModalContent') aggregaModalContent: TemplateRef<any>;
  @ViewChild('rifArticolo') rifArticolo: NgSelectComponent
  @ViewChild('create') createTemplateForm: TemplateRef<any>;

  formPersonale: FormGroup;
  formMezzi: FormGroup;
  formDescrizioneAttivita: FormGroup;
  formBeniDiConsumo: FormGroup;
  formAllegatieDomande: FormGroup;

  items: MenuItem[];
  activeIndex = 0;

  exportService = inject(PdfService);

  // variabili usate per riordinare. Di default ordino usando la data di scadenza
  sortCol = 'id';
  sortDir = 'desc';
  // variabile utilizzata per l'apertura del popup aggiungi report
  size: number;
  // array che contiene gli id delle note selezionate usando le checkbox
  checked: number[] = [];
  // array che contiene i report relativi a questo cantiere
  reportCantiere: reportShortModel[] = [];
  // array che contiene il personale selezionato da aggiungere al cantiere
  nuovoreport: any[] = [];

  index = 0;

  // array che contiene il personale relativo a questo cantiere
  personaleCantiere: Personale[] = [];
  personaleCantiereNgSelect: (Personale[])[] = [];

  absenceReasonsNgSelect: string[] = [
    'Formazione',
    'Aspettativa retribuita',
    'Assenza assunti/dimessi',
    'Assenza ingiustificata',
    'Allattamento',
    'Aspettativa non retribuita',
    'Congedo parentale',
    'Infortunio',
    'Malattia',
    'Sciopero',
    'Cassa integrazione (evento maltempo)',
    'Ferie',
    'Malattia ospedaliera',
    'Maternità',
    'Permessi disabili a ore (104)',
    'Permessi lutto/grave infermità',
    'Permessi retribuiti'
  ];


  // array che contiene i mezzi relativi a questo cantiere
  mezziCantiere: ListaMezziDiCantiere[];
  mezziCantiereNgSelect: (ListaMezziDiCantiere[])[] = [];
  // array che contiene il prezziario generale
  prezziario: ServizioCliente[] = [];
  // variabile che contiene tutti i fornitori di questo cantiere
  fornitoriget: Supplier[] = []
  // variabile che contiene tutti i servizi di tutti i fornitori
  serviziget: ServizioFornitore[] = [];
  // variabile che contiene i servizi di un fornitore in base a quello scelto nel form di creazione. Cambia ogni volta
  serviziSingleFornitore: ServizioFornitore[][] = [];
  // variabile che contiene la larghezza dello schermo(es.: 1000)
  screenWidth;
  // variabile che contiene il cantiere in questione su cui si farà il report
  cantiere = new Cantiere();
  // variabile che contiene il cantiere in questione su cui si farà il report
  contratto = new Contratto();

  // variabili usata quando viene aggiunto un file allegato al report nello step allegati
  fileName = '';
  formData = new FormData();

  // variabile usata per mostrare a seconda dell'unità di musura del servizio offerto i diversi input(es altezza,lunghezza, ...)
  umSelected = [''];
  // variabile usata nello step beni e servizi per far apparire l'icona della ricarica
  ric = false;
  // variabile usata per mostrare o non mostrare lo spinner nello step 3 rif. Articolo Prezzario
  loading = [false];

  // gestione allegati
  formDataAllegati = new FormData();
  formDataProvvisteNames: string[][] = [];
  formDataLavoriEseguitiNames: string[][] = [];
  // formdata da inviare separatamente al backend al termine della creazione un report
  filesLavoriEseguiti: File[];
  filesProvviste: File[];
  filesAllegatiEQuestionario: File[];
  // firma
  firma = '';
  // data di riferimento report inserita nell'ultimo step
  referenceDate;
  // contiene l'ultimo prezzo carburante più recente
  defaultGasPrice = null;

  // variabili che contengolo le somme totali di ogni step del report
  costoTotaleAllPersonale;
  costoTotaleAllMezzi;
  costoTotaleAllLavoriEseguiti;
  costoTotaleAllProvviste;

  // flag attivo in caso di modifica di un report
  reportModifyFlag: { modify: boolean, reportId: number } = {
    modify: false, reportId: null,
  };

  /////////////////////////////////////// testing////////////////////////////////
  searchString: string[] = [];
  listaSearch = [];

  //////////////////////////////////////////////////////////////////////////////////

  personaleQuickCreation: NgbModalRef;

  ////////////////////////////////////////////////////////////////////////////////
  mezzoQuickCreationTemplate: NgbModalRef;

  /////////////////////////////////////////////////////////////////////////////////

  fornitoreQuickCreationTemplate: NgbModalRef;

  serviziFornitoreQuickCreationTemplate: NgbModalRef;

  ///////////////////////////////////////////////////////////////////////////////////
  articoloPrezzarioQuickCreationTemplate: NgbModalRef;

  // chiamata quando si ridimensiona lo schermo
  onScreenResize(event) {
    console.warn('larghezza schermo', event.currentTarget.innerWidth);
    if (event.currentTarget.innerWidth < 500) {
      this.navBarLocation = '';
    } else {
      this.navBarLocation = 'top';
    }
  }

  //file che vengono caricati durante la fase delle foto, sono delle variabili File ma contengono anche "imgSrc" per visualizzarle
  photos: any[] = [];


  selectedReport: reportShortModel = new reportShortModel();
  selectedAttachmentsIndex = 0;


  // @ViewChildren('rifArticolo') rifArticolo: NgSelectComponent;

  constructor(
    private spinner: NgxSpinnerService,
    private ngselect: NgSelectConfig,
    private service: CantieriService,
    private router: Router,
    private modalService: NgbModal,
    private ref: ChangeDetectorRef,
    private prezziarioservice: ServiziClienteService,
    private fornitoriService: SupplierService,
    private cantieriservice: CantieriService,
    private contrattoservice: ContrattoService,
    private servizicliente: ServiziClienteService,
    private mezziservice: MezziService,
    private servicepersonale: PersonaleService,
    private _http: HttpClient,
    public _auth: AuthService,
    private cdr: ChangeDetectorRef,
    private _fileservice: FileService,
    private _systemParameterService: SystemParametersService,
    private fb: FormBuilder
  ) {

    this.initializeForms();

    this.items = [
      {
        label: 'Manodopera', command: (event: any) => {
          this.onStepClick(event);
        }
      },
      {
        label: 'Mezzi e Attrezzature', command: (event: any) => {
          this.onStepClick(event);
        }
      },
      {
        label: 'Materiali - Noli - Servizi Esterni', command: (event: any) => {
          this.onStepClick(event);
        }
      },
      {
        label: 'Attività di Ricavo', command: (event: any) => {
          this.onStepClick(event);
        }
      }, {
        label: 'Foto', command: (event: any) => {
          this.onStepClick(event);
        }
      },
      {
        label: 'Autore e data', command: (event: any) => {
          this.onStepClick(event);
        }
      }
    ];

    // impostazioni dell'ngSelect
    this.ngselect.notFoundText = 'Nessun elemento trovato';
    this.ngselect.addTagText = 'Aggiungi un tag';
    this.mostraCosti = true;
    this.mostraRicavi = true;
    this.mostraFoto = true;
    this.reportCompleto = true;
    this.idReport = 0;

    this.addControlsToFormArrays();
  }

  private initializeForms() {
    this.formPersonale = this.fb.group({
      employees: this.fb.array([]),
      hours: this.fb.array([]),
      extraordinaryHours: this.fb.array([]),
      ordinaryCost: this.fb.array([]),
      extraordinaryCost: this.fb.array([]),
      travelHoursCost: this.fb.array([]),
      travelHours: this.fb.array([]),
      totalCost: this.fb.array([]),
      ordinaryAmount: this.fb.array([]),
      extraordinaryAmount: this.fb.array([]),
      travelAmount: this.fb.array([]),
      absenceHours: this.fb.array([]),
      absenceReasons: this.fb.array([])
    });

    this.formMezzi = this.fb.group({
      vehicles: this.fb.array([]),
      liters: this.fb.array([]),
      costPerLiter: this.fb.array([]),
      dailyPrice: this.fb.array([]),
      fuelTotalPrice: this.fb.array([]),
      totalPrice: this.fb.array([])
    });

    this.formDescrizioneAttivita = this.fb.group({
      activities: this.fb.array([]),
      prezziario: this.fb.array([]),
      quantities: this.fb.array([]),
      equalParts: this.fb.array([]),
      lengths: this.fb.array([]),
      widths: this.fb.array([]),
      heights: this.fb.array([]),
      ums: this.fb.array([]),
      unitaryPrices: this.fb.array([]),
      totalPrice: this.fb.array([]),
      category: this.fb.array([]),
      attachments: this.fb.array([])
    });

    this.formBeniDiConsumo = this.fb.group({
      descriptions: this.fb.array([]),
      suppliers: this.fb.array([]),
      quantities: this.fb.array([]),
      ums: this.fb.array([]),
      unitaryPrices: this.fb.array([]),
      totalPrices: this.fb.array([]),
      attachments: this.fb.array([])
    });

    this.formAllegatieDomande = this.fb.group({
      meteo: new FormControl(),
      mezzi: new FormControl(),
      fornitori: new FormControl(),
      risorseUmane: new FormControl(),
      commentiMeteo: new FormControl(),
      commentiAttrezzatureMezzi: new FormControl(),
      commentiFornitori: new FormControl(),
      commentiRisorseUmane: new FormControl(),
      commenti: new FormControl(),
      // gli allegati saranno gestiti tramite formData
    });
  }

  selectReport(report: reportShortModel) {
    this.selectedReport = report;
  }

  private addControlsToFormArrays() {
    const personaleArrays = [
      'employees',
      'hours',
      'extraordinaryHours',
      'ordinaryCost',
      'extraordinaryCost',
      'travelHoursCost',
      'travelHours',
      'totalCost',
      'ordinaryAmount',
      'extraordinaryAmount',
      'travelAmount',
      'absenceHours',
      'absenceReasons'
    ];
    this.addControlToFormArray(this.formPersonale, personaleArrays);

    const mezziArrays = [
      'vehicles',
      'liters',
      'costPerLiter',
      'dailyPrice',
      'fuelTotalPrice',
      'totalPrice'
    ];
    this.addControlToFormArray(this.formMezzi, mezziArrays);

    const descrizioneAttivitaArrays = [
      'activities',
      'prezziario',
      'quantities',
      'equalParts',
      'lengths',
      'widths',
      'heights',
      'ums',
      'unitaryPrices',
      'totalPrice',
      'category',
      'attachments'
    ];
    this.addControlToFormArray(this.formDescrizioneAttivita, descrizioneAttivitaArrays);

    const beniDiConsumoArrays = [
      'descriptions',
      'quantities',
      'suppliers',
      'ums',
      'unitaryPrices',
      'totalPrices',
      'attachments'
    ];
    this.addControlToFormArray(this.formBeniDiConsumo, beniDiConsumoArrays);
  }

  arrayRemove(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }

  addControlToFormArray(formGroup: FormGroup, formArrayNames: string[], controlValue: any = null) {
    formArrayNames.forEach(name => {
      const formArray = formGroup.get(name) as FormArray;
      if (formArray) {
        formArray.push(new FormControl(controlValue));
      } else {
        console.error(`FormArray with name ${name} not found in the provided FormGroup`);
      }
    });
  }

  addInputFormPersonale() {
    const formArrayNames = [
      'employees',
      'hours',
      'extraordinaryHours',
      'ordinaryCost',
      'extraordinaryCost',
      'travelHoursCost',
      'travelHours',
      'totalCost',
      'ordinaryAmount',
      'extraordinaryAmount',
      'travelAmount',
      'absenceHours',
      'absenceReasons'
    ];
    this.addControlToFormArray(this.formPersonale, formArrayNames);
    this.updateTendinePersonaleNgSelect();
  }

  addInputFormMezzi() {
    const formArrayNames = [
      'vehicles',
      'liters',
      'costPerLiter',
      'dailyPrice',
      'fuelTotalPrice',
      'totalPrice'
    ];
    this.addControlToFormArray(this.formMezzi, formArrayNames);
    this.updateTendineMezziNgSelect();
  }

  addInputFormDescrizioneAttivita() {
    const formArrayNames = [
      'activities',
      'prezziario',
      'quantities',
      'equalParts',
      'lengths',
      'widths',
      'heights',
      'ums',
      'unitaryPrices',
      'totalPrice',
      'category',
      'attachments'
    ];
    this.addControlToFormArray(this.formDescrizioneAttivita, formArrayNames);
    this.umSelected.push('');
    this.loading.push(false);
  }

  addInputFormBeniDiConsumo() {
    const formArrayNames = [
      'descriptions',
      'quantities',
      'suppliers',
      'ums',
      'unitaryPrices',
      'totalPrices',
      'attachments'
    ];
    this.addControlToFormArray(this.formBeniDiConsumo, formArrayNames);
  }

  onStepClick(event: any) {
    this.activeIndex = event.index;
    console.log('Clicked step index: ', event.index);
    // Puoi aggiungere qui qualsiasi logica aggiuntiva che desideri eseguire quando uno step viene cliccato
  }

  // usato nel caso in cui il report debba automaticamente aprirsi
  ngOnChanges(changes: SimpleChanges): void {
    if (this.openReport == true) {
      document.getElementById('openReportButton').click();
    }
    if (this.targetCantiereId) {
      this.ngOnInit();
    }
  }

  ngOnDestroy(): void {
    this.modalService.dismissAll();
  }

  transformMezzoToListaMezziDiCantiere(mezzo: Mezzo): ListaMezziDiCantiere {
    return {
      id: mezzo.id,
      idMezzi: mezzo.id,
      mezzo: mezzo,
      idCantiere: null,
      fromdate: null,
      toDate: null,
    };
  }

  // chiamata quando si apre il popup
  scaricaDatiPerCreazioneReport() {

    function transformMezzoToListaMezziDiCantiere(mezzo: Mezzo): ListaMezziDiCantiere {
      return {
        id: mezzo.id,
        idMezzi: mezzo.id,
        mezzo: mezzo,
        idCantiere: null,
        fromdate: null,
        toDate: null,
      };
    }

    // acquisisco tutti i mezzi
    this.ScaricaAllMezzi(transformMezzoToListaMezziDiCantiere);
    this.getGasolinePrice();

    // acquisisco tutti i fornitori
    this.ScaricaAllFornitori();

    // scarico tutti i servizi di tutti i fornitori. Poi elimino i servizi dei fornitori non inerenti a questo cantiere
    this.ScaricaAllServiziFornitori();

    this.cantieriservice.getCantiereFullSpecification(this.targetCantiereId)
      .subscribe(
        (res) => {
          LoggingService.log('cantiere relativo ottenuto', LogLevel.debug, res);
          this.cantiere = res;
        },
        (err) => {
          LoggingService.log('ERRORE get cantiere', LogLevel.error, err);
        },
        async () => {
          // scarico il prezziario collegato a quel contratto
          // this.getContratto(this.cantiere.idContratto);
          const contratto = await this.contrattoservice.getContratto(this.cantiere.contratto.id).toPromise();
          // acquisisco tutto il personale
          this.ScaricaAllPersonale();
          this.cantiere.contratto.idPrezziarioCliente
          // NON SCARICO L'INTERO PREZZARIO
          // this.getPrezziario(this.cantiere.contratto.idPrezziarioCliente);
          // SCARICO SOLO UNA PARTE
          this.cantiere.contratto.prezzari_id = contratto.prezzari_id;
          this.servizicliente.cercaArticoloPrezzario(contratto.prezzari_id, '').subscribe(
            (res) => {
              console.log('lista articoli prezzario', res);
              this.prezziario = res;
            },
            (err) => {
              console.error('error get articoli prezzario', err)
            },
          )
        },
      )
  }

  private async ScaricaAllFornitori() {
    const res = await this.fornitoriService.getAllFornitori().toPromise()
      .catch((err) => LoggingService.log('errore nel get di tutti i fornitori', LogLevel.warn, err));
    if (res) {
      console.warn('ACQUISITO TUTTI I FORNITORI', res);
      this.fornitoriget = res;
    }

  }

  private async ScaricaAllServiziFornitori() {
    const res = await this.fornitoriService.getAllServizi().toPromise()
      .catch((err) => {
        LoggingService.log('ERRORE get beni e servizi', LogLevel.error, err);
        this.discardServizi();
      });
    if (res) {
      LoggingService.log('beni e servizi ottenuti', LogLevel.debug, res);
      this.serviziget = res;
      this.discardServizi();
    }

  }

  private async ScaricaAllMezzi(transformMezzoToListaMezziDiCantiere: (mezzo: Mezzo) => ListaMezziDiCantiere) {

    const res = await this.mezziservice.getAllMezzi()
      .pipe(
        map(mezzi => mezzi.map(transformMezzoToListaMezziDiCantiere))
      )
      .toPromise().catch((err) => {
        LoggingService.log('errore nel get dei mezzi del cantiere', LogLevel.warn, err);
      });

    if (res) {
      this.mezziCantiere = [];
      res.forEach((mezzo) => {
        const x = this.mezziCantiere.find(m => m.mezzo.id == mezzo.mezzo.id);
        if (!x) {
          mezzo.mezzo.fullDescription = mezzo.mezzo.description + ' ' + mezzo.mezzo.brand + ' ' + mezzo.mezzo.model + ' ' + mezzo.mezzo.licensePlate;
          this.mezziCantiere.push(mezzo);
        }
      });
      this.tempData = [...this.mezziCantiere];
      this.mezziCantiereNgSelect[0] = [...this.mezziCantiere];
    }
  }

  private async getGasolinePrice() {
    this.defaultGasPrice = (await lastValueFrom(this._systemParameterService.getByKey('gas'))).value;
    console.log('PREZZO GAS', this.defaultGasPrice)
  }

  private async ScaricaAllPersonale() {
    const res = await this.servicepersonale.getAllPersonale()
      .toPromise().catch(
        (err) => {
          LoggingService.log('errore nel get del personale', LogLevel.warn, err);
        }
      );

    console.warn('ACQUISITO TUTTO IL PERSONALE', res);
    if (res) {
      res.forEach(personale => {
        personale.fullName = personale.name + ' ' + personale.surname;
        const check = this.personaleCantiere.find(p => p.id == personale.id);
        if (!check) {
          this.personaleCantiere.push(personale);
        }
      });
    }

    LoggingService.log('personale ottenuto', LogLevel.debug, this.personaleCantiere);

    this.tempData = [...this.personaleCantiere];
    this.personaleCantiereNgSelect[0] = [...this.personaleCantiere];
    this.checkIfUserCanApproveReport();
    return;

  }

  ngOnInit(): void {

    // controllo la larghezza dello schermo

    if (window.innerWidth < 500) {
      this.navBarLocation = '';
    } else {
      this.navBarLocation = 'top';
    }

    LoggingService.log('ricarico? :', LogLevel.debug, [this.formPersonale.value, this.formMezzi.value, this.formDescrizioneAttivita.value, this.formBeniDiConsumo.value, this.formAllegatieDomande.value]);

    // prelevo la larghezza dello schermo
    this.screenWidth = screen.width;
    LoggingService.log('lo schermo inizialmente è largo :', LogLevel.debug, this.screenWidth);

    // scarico i dati necessari per la creazione di un report
    this.scaricaDatiPerCreazioneReport();

    this.getUser();

    this.cantieriservice.getReportDiCantiere(this.targetCantiereId).subscribe(
      (res: reportShortModel[]) => {
        console.warn('Lista di report per questo cantiere scaricata', res);
        // Converti le stringhe di date in oggetti Date
        this.reportCantiere = res.map(report => {
          if (report.referenceDate) {
            const parts = report.referenceDate.split('-');
            report.referenceDateAsDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
          return report;
        });

        this.cdr.detectChanges();

        setTimeout(() => {
          // this.sort({sorts:[{ prop: 'id', dir: 'desc' }]});
          document.getElementById('ngx-report')?.click();
          this.getAttachmentsReports(0);
        }, 2000);

      },
      (err) => {
        console.error('Errore get lista report per questo cantiere', err);
      },
    )

  }

  onPageChanged(event: { count: number, limit: number, pageSize: number, offset: number }) {
    this.getAttachmentsReports(event.offset)
  }

  getUser() {
    this.servicepersonale.getPersonaleFromUserName(this._auth.whoAmI().username).subscribe(
      (res) => {
        this.user = res.name + ' ' + res.surname
      },
      (err) => {
        console.error('ERRORE GET USER');
      },
    );
  }

  // funzione chiamata quando si riordina la tabella usando gli header delle colonne
  sort(event) {
    LoggingService.log('sortato', LogLevel.debug, event);
    this.sortCol = event.sorts[0].prop;
    this.sortDir = event.sorts[0].dir;
  }

  downloadReport(row) {
    console.log('scarico', row);
    const authHeaders = this._auth.retrieveHeaders();
    this.spinner.show('spinner3',
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#fcfc03', // colore icona che si muove
        fullScreen: true
      });
    this._http.get(AppConfigService.settings.apiServer.baseUrl + '/home/printindex/' + row.id,
      { headers: authHeaders, observe: 'body', responseType: 'arraybuffer' })
      .subscribe(
        (res: any) => {
          this.spinner.hide('spinner3');
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob([res], { type: 'application/pdf' }));
          downloadLink.download = 'Report ' + this.cantiere.shortDescription + ' ' + row.referenceDate + '.pdf';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          window.URL.revokeObjectURL(downloadLink.href);
          document.body.removeChild(downloadLink);
        },
        (err) => {
          console.error(err);
          this.spinner.hide('spinner3');
        }
      );

  }

  getPrezziario(idPrezziarioGenerale: number) {
    this.servizicliente.getAllServiziCliente(idPrezziarioGenerale)
      .subscribe(
        (res) => {

          this.prezziario = res;

          LoggingService.log('prezziario relativo al cantiere ottenuto', LogLevel.debug, this.prezziario);
        },
        (err) => {
          LoggingService.log('ERRORE get servizi clienti (prezziario) ', LogLevel.error, err);
        },
        () => {
        },
      )
  }

  getAttachmentsReports(pagenumber: number) {

    let l = this.reportCantiere.length;
    // ATTENZIONE i report cantiere sono disposti nell'array da indice più piccolo al più grande, ma nella tabella vengono mostrati al contrario
    this.reportCantiere.slice(Math.max(l - this.pageSize * (pagenumber + 1), 0), l - pagenumber * this.pageSize).forEach((e: reportShortModel) => {
      this.cantieriservice.getAttachmentsReport(this.targetCantiereId, e.id, 'LavoriEseguiti').subscribe(
        (res) => {

          e.allegatiLavoriEseguiti = [...res];
          this.reportCantiere = [...this.reportCantiere];
          this.cdr.detectChanges();
          // if (document.getElementById('tableReport'))
          //   document.getElementById('tableReport').click();
          // document.getElementById('Azioni').click();
        },
        (err) => {
          console.error('ERRORE attachments lavori eseguiti ', err)
        },
      );
      this.cantieriservice.getAttachmentsReport(this.targetCantiereId, e.id, 'Provviste').subscribe(
        (res) => {

          e.allegatiProvviste = [...res];
          this.reportCantiere = [...this.reportCantiere];
          this.cdr.detectChanges();
          // if (document.getElementById('tableReport'))
          //   document.getElementById('tableReport').click();
          // document.getElementById('Azioni').click();
        },
        (err) => {
          console.error('ERRORE attachments provviste ', err)
        },
      );
      this.cantieriservice.getAttachmentsReport(this.targetCantiereId, e.id, 'AllegatiEQuestionario').subscribe(
        (res) => {

          e.allegatiDomande = [...res];
          this.reportCantiere = [...this.reportCantiere];
          this.cdr.detectChanges();
          // if (document.getElementById('tableReport'))
          //   document.getElementById('tableReport').click();
          // document.getElementById('Azioni').click();
        },
        (err) => {
          console.error('ERRORE AllegatiEQuestionario ', err)
        },
      );
      this.cantieriservice.getAttachmentsReport(this.targetCantiereId, e.id, 'Foto').subscribe(
        (res) => {

          e.foto = [...res];
          this.reportCantiere = [...this.reportCantiere];
          this.cdr.detectChanges();
        },
        (err) => {
          console.error('ERRORE Foto ', err)
        },
      );
    })
  }

  // metodo chiamato una volta scaricati i fornitori del cantiere e tutti i servizi sul db.
  // elimina da tutti i servizi quelli relativi a fornitori non relativi a questo cantiere
  discardServizi() {
    // variabile che contiene gli id dei fornitori di questo cantiere
    LoggingService.log('servizi prima della pulizia', LogLevel.debug, this.serviziget);

    // id dei fornitori di questo cantiere
    const ids: number[] = [];
    const idToDelete: number[] = [];
    let i = 0;

    this.fornitoriget.forEach((i) => {
      ids.push(i.id);
    })
    LoggingService.log('elenco id fornitori di questo cantiere', LogLevel.debug, ids);
    // elimino dalla lista di tutti i servizi, quelli che hanno id fornitore diverso da tutti gli id contenuti in ids
    this.serviziget.forEach((servizio) => {
      let flag = false;
      for (let i = 0; i < ids.length; i++) {
        if (Number.parseInt(servizio.idFornitore) == ids[i]) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        // eliminino dall'array dei servizi il servizio inerente ad un fornitore non presente in questo cantiere

        idToDelete.push(Number.parseInt(servizio.idFornitore));
        // LoggingService.log("servizi in corso", LogLevel.debug, this.serviziget);
      }
      i++;
    })

    idToDelete.forEach((i) => {
      // LoggingService.log("servizi adesso", LogLevel.debug, this.serviziget);
      this.serviziget.splice(this.serviziget.indexOf(this.serviziget.find(x => Number.parseInt(x.idFornitore) == i)), 1);
      // LoggingService.log("servizi adesso 2", LogLevel.debug, this.serviziget);
    })
    LoggingService.log('servizi ultimati', LogLevel.debug, this.serviziget);

  }

  // funzione chiamata quando viene selezionato un fornitore nello step Beni e Servizi
  serviziFornitoreBeniDiConsumo(fornitore: Supplier, index: number) {
    // inserisco nella variabile serviziSingleFornitore[index] la lista dei servizi del fornitore
    LoggingService.log('fornitore', LogLevel.debug, fornitore)
    // if(fornitore==undefined){
    //   this.serviziSingleFornitore[index] = [];
    //   return;
    // }
    if (fornitore == undefined) {
      this.serviziSingleFornitore[index] = [];
      return;
    }
    const listaServizi: ServizioFornitore[] = [];
    if (fornitore != undefined) {
      this.serviziget.forEach(element => {
        if (Number.parseInt(element.idFornitore) == fornitore.id) {
          listaServizi.push(element);
        }
      });
      this.serviziSingleFornitore[index] = listaServizi;
    }
  }

  // funzione chiamata quando viene eliminato un fornitore dal menu a tendina nello step Beni e Servizi
  deleteServiziFornitoreBeniDiConsumo(index: number) {
    this.serviziSingleFornitore[index] = [];
  }

  // filtro
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    LoggingService.log('filtro add personale', LogLevel.debug, this.tempData)
    // filter our data
    const temp = this.tempData.filter(function (d) {

      return d.id.indexOf(val) !== -1 || !val;
    });
    // aggiorna le righe della tabella dopo il filtraggio
    this.reportCantiere = temp;

  }

  // funzione chiamata in seguito alla selezione di una checkbox
  onSelect(event) {

    LoggingService.log('selezionato', LogLevel.debug, event)
  }

  // metodo utilizzato dal tasto "aggiungi report" per aprire un popup
  openLg(content) {
    // per sicurezza riscarico i dati per avere consistenza
    this.spinner.show('spinner1',
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });

    // this.ngOnInit();

    // cotrollo se nel localstorage c'è della roba in modo da popolare il report
    this.checkOldData().then(() => {

      setTimeout(() => {
        this.spinner.hide('spinner1');
        this.modalService.open(content, {
          size: 'xl', scrollable: true, keyboard: false, backdrop: 'static', fullscreen: true
        });

      }, 2000);

    })
      .catch((e) => {
        console.error('checkolddata fallito', e);
        this.spinner.hide('spinner1');
      })
  }

  async lookingForDraft() {
    const draftReport = await this.service.getReportDiCantiere(this.targetCantiereId, null, null, null, true).toPromise();
    if (Array.isArray(draftReport) && draftReport.length == 1) {

      this.modifyReportDiCantiere(draftReport[0], this.createTemplateForm)
      // var report = await this.service.getReportFullSpec(this.targetCantiereId, draftReport[0].id).toPromise();
      // console.log();

    }

  }

  /**
   * Utilizzata per prepopolare il form con i dati dell'ultimo report di cantiere
   * @param content NGTemplate: form di creazione del report
   */
  duplicateLastReport(content: TemplateRef<any>) {
    this.cantieriservice.getLastReportDiCantiere(this.targetCantiereId).subscribe(
      (res) => {
        if (res.ok && res.body) {
          console.log('Ultimo report presente', res.body);
          this.modifyReportDiCantiere(res.body, content, true);
        } else {
          // non faccio nulla
        }
      },
      (err) => {
        console.error('Errore get ultimo report presente');
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Non sono riuscito a duplicare l\'ultimo report',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
        this.spinner.hide();
      },
    )
  }

  // metodo utilizzato dal formwizard
  ngAfterViewInit() {

    setTimeout(() => {
      this.ref.detectChanges();
    }, 100);

  }

  validationform(form) {
    LoggingService.log('form report', LogLevel.debug, form.value)
    // LoggingService.log('formbuildeer', LogLevel.debug, this.formBuilder)
  }

  // metodo chiamato alla selezione di uno o piu persone nell'ng-select nel form di creazione del report step 1
  changePersonale(event: Personale, control: number) {

    LoggingService.log('control è', LogLevel.debug, control);
    const employees = (this.formPersonale.get('employees') as FormArray);
    const topic = employees.at(control);
    if (event) {
      topic.setValue(event);
    }
    if (event == undefined) {
      // se entro in questo controllo significa che è stata eliminata la persona dal menu a tendina
      // svuoto i costi orari, il totale e la persona
      (this.formPersonale.get('employees') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('ordinaryCost') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('extraordinaryCost') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('travelHoursCost') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('totalCost') as FormArray).at(control).setValue(null);


      (this.formPersonale.get('ordinaryAmount') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('extraordinaryAmount') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('travelAmount') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('absenceHours') as FormArray).at(control).setValue(null);
      (this.formPersonale.get('absenceReasons') as FormArray).at(control).setValue(null);

      // aggiorno le tendine del personale
      this.updateTendinePersonaleNgSelect();
      return;
    }

    // ghetto anche i costi orari in base al personale selezionato
    const ordinaryCosts = (this.formPersonale.get('ordinaryCost') as FormArray);
    const extraordinaryCosts = (this.formPersonale.get('extraordinaryCost') as FormArray);
    const travelHoursCost = (this.formPersonale.get('travelHoursCost') as FormArray);
    const oc = ordinaryCosts.at(control);
    const ec = extraordinaryCosts.at(control);
    const tc = travelHoursCost.at(control);
    let persona = new Personale();

    if (event) {
      persona = this.personaleCantiere.find(i => i.id == event.id);
    }
    if (event) {
      oc.setValue(persona.ordinaryPrice);
      ec.setValue(persona.extraordinaryPrice);
      tc.setValue(persona.travelPrice);
    }
    LoggingService.log('form Personale change', LogLevel.debug, this.formPersonale);
    this.calculateTotalCost(control);
    this.updateTendinePersonaleNgSelect();
  }

  // metodo chiamato alla selezione di un numero di ore ordinarie lavorate nel form di creazione del report step 1
  changeHours(event, control) {
    const hours = (this.formPersonale.get('hours') as FormArray)
    const hour = hours.at(control);
    hour.setValue(event.target.value);
    LoggingService.log('form Personale change', LogLevel.debug, this.formPersonale);
    this.calculateTotalCost(control);

  }

  // metodo chiamato alla selezione di un numero di ore straordinarie lavorate nel form di creazione del report step 1
  changeExtraordinaryHours(event, control) {
    const extraHours = (this.formPersonale.get('extraordinaryHours') as FormArray)
    const hour = extraHours.at(control);
    hour.setValue(event.target.value);
    LoggingService.log('form Personale change', LogLevel.debug, this.formPersonale);
    this.calculateTotalCost(control);
  }

  // metodo chiamato alla selezione di un numero di ore di viaggio lavorate nel form di creazione del report step 1
  changeTravelHours(event, control) {
    const travelHours = (this.formPersonale.get('travelHours') as FormArray)
    const hour = travelHours.at(control);
    hour.setValue(event.target.value);
    LoggingService.log('form Personale change', LogLevel.debug, this.formPersonale);
    this.calculateTotalCost(control);
  }

  changeAbsenceHours(event, control) {
    const absenceHours = (this.formPersonale.get('absenceHours') as FormArray)
    const hour = absenceHours.at(control);
    hour.setValue(event.target.value);
    LoggingService.log('form Personale change', LogLevel.debug, this.formPersonale);
  }

  // calcolo il costoTotale del personale
  calculateTotalCost(control: number) {

    const employees = (this.formPersonale.get('employees') as FormArray)
    const topic = employees.at(control)
    if (topic == null) {
      return;
    }
    const ordinaryHours = (this.formPersonale.get('hours') as FormArray);
    const extraHours = (this.formPersonale.get('extraordinaryHours') as FormArray);
    const travelHours = (this.formPersonale.get('travelHours') as FormArray);
    const ordinaryCosts = (this.formPersonale.get('ordinaryCost') as FormArray);
    const extraordinaryCosts = (this.formPersonale.get('extraordinaryCost') as FormArray);
    const travelHoursCost = (this.formPersonale.get('travelHoursCost') as FormArray);
    const oh = ordinaryHours.at(control).value;
    const eh = extraHours.at(control).value;
    const th = travelHours.at(control).value;
    LoggingService.log('le ore ordinarie, straordinare e di viaggio sono:', LogLevel.debug, [eh, oh, th]);
    // oh = Number.parseInt(oh);
    // eh = Number.parseInt(eh);
    const oc = ordinaryCosts.at(control).value;
    const ec = extraordinaryCosts.at(control).value;
    const tc = travelHoursCost.at(control).value;
    const totalCosts = (this.formPersonale.get('totalCost') as FormArray);
    const tot = totalCosts.at(control);
    LoggingService.log('costo totale xxxxx', LogLevel.debug, [oh, eh, oc, ec, th, tc]);
    const sum = Number.parseFloat((oh * oc + eh * ec + th * tc).toFixed(2))
    tot.setValue(sum);

    // calcolo il costo ordinario totale della persona
    let ordinaryAmount = (this.formPersonale.get('ordinaryAmount') as FormArray).at(control).setValue((oc * oh).toFixed(2));
    // calcolo il costo straordinario totale della persona
    const extraordinaryAmount = (this.formPersonale.get('extraordinaryAmount') as FormArray).at(control).setValue((ec * eh).toFixed(2));
    // calcolo il costo degli spostamenti totale della persona
    ordinaryAmount = (this.formPersonale.get('travelAmount') as FormArray).at(control).setValue((tc * th).toFixed(2));
    // calcolo la somma dei costi totali di tutte le persone inserite
    this.calculateAllPersonaleTotalCost();
    // aggiorno le tendine di selezione del personale
    this.updateTendinePersonaleNgSelect();
  }

  // metodo chiamato al click del logo del cestino nel form del personale step 1
  deleteFormPersonaleElement(i) {
    LoggingService.log('elimina elemento form', LogLevel.debug, i);
    (this.formPersonale.get('employees') as FormArray).removeAt(i);
    (this.formPersonale.get('hours') as FormArray).removeAt(i);
    (this.formPersonale.get('extraordinaryHours') as FormArray).removeAt(i);
    (this.formPersonale.get('travelHours') as FormArray).removeAt(i);
    (this.formPersonale.get('ordinaryCost') as FormArray).removeAt(i);
    (this.formPersonale.get('extraordinaryCost') as FormArray).removeAt(i);
    (this.formPersonale.get('travelHoursCost') as FormArray).removeAt(i);
    (this.formPersonale.get('totalCost') as FormArray).removeAt(i);


    (this.formPersonale.get('ordinaryAmount') as FormArray).removeAt(i);
    (this.formPersonale.get('extraordinaryAmount') as FormArray).removeAt(i);
    (this.formPersonale.get('travelAmount') as FormArray).removeAt(i);
    (this.formPersonale.get('absenceHours') as FormArray).removeAt(i);
    (this.formPersonale.get('absenceReasons') as FormArray).removeAt(i);


    // ricalcolo il costo totale del personale
    this.calculateAllPersonaleTotalCost();

  }

  // calcolo la somma dei costi totali di tutte le persone inserite
  calculateAllPersonaleTotalCost() {

    let sum = 0;
    console.log((this.formPersonale.get('totalCost') as FormArray));
    (this.formPersonale.get('totalCost') as FormArray).value.forEach(element => {
      sum += element
    });
    console.log('somma costo personale', sum);
    this.costoTotaleAllPersonale = sum;

  }

  // Aggiorna le tendine di selezione del personale in modo da non permettere di selezionare una persona già selezionata
  updateTendinePersonaleNgSelect() {
    const personaleCounter = (this.formPersonale.get('employees') as FormArray).length;
    const allSelected: Personale[] = (this.formPersonale.get('employees') as FormArray).value;
    this.personaleCantiereNgSelect = [];
    // var list = [];
    for (let i = 0; i < personaleCounter; i++) {
      const selected: Personale = (this.formPersonale.get('employees') as FormArray).at(i).value;
      // NON devo scartare la persona selezionata, cioè devo lasciarla nella tendina
      const y = this.personaleCantiere.filter(x => (!allSelected.filter(x => x != null).map(z => z.id).includes(x.id))
      );
      // QUESTO BLOCCO DI CODICE COMMENTATO DOVREBBE ESSERE USATO SE VOGLIO MOSTRARE LA PERSONA SELEZIONATA NELLA TENDINA
      // È COMMENTATO PERCHE' NON FUNZIONA
      // if (y.find(x => x.id == selected.id) == null)
      //   y.push(selected);

      this.personaleCantiereNgSelect[i] = y;
    }
  }

  // metodo chiamato alla selezione di un mezzo nell'ng-select nel form di creazione del report step 2
  changeMezzo(event: ListaMezziDiCantiere, control: number) {
    LoggingService.log('control è', LogLevel.debug, control);
    const vehicles = (this.formMezzi.get('vehicles') as FormArray);
    const vehicle = vehicles.at(control);

    if (event) {
      vehicle.setValue(event);
    }
    if (event == undefined) {
      (this.formMezzi.get('vehicles') as FormArray).at(control).setValue(null);
      (this.formMezzi.get('dailyPrice') as FormArray).at(control).setValue(null);
      (this.formMezzi.get('totalPrice') as FormArray).at(control).setValue(null);
      // aggiorno le tendine dei mezzi
      this.updateTendineMezziNgSelect();
      return;
    }

    // setto il costo giornaliero del mezzo
    const dailyPrice = (this.formMezzi.get('dailyPrice') as FormArray).at(control);
    // scarico il dato e poi lo imposto
    if (event) {
      LoggingService.log('mezzo selezionato', LogLevel.debug, event);
      const x = this.mezziCantiere.find(i => i.idMezzi == event.mezzo.id);
      LoggingService.log('mezzo cambiato', LogLevel.debug, x);
      dailyPrice.setValue(x.mezzo.dailyCost);
    }

    LoggingService.log('form mezzi change', LogLevel.debug, this.formMezzi);
    this.calculateVehiclePrices(control);
    this.updateTendineMezziNgSelect();
  }

  // metodo chiamato alla selezione di un numero di litri di gasolio nel form di creazione del report step 2
  changeVehicleLiters(event, control) {
    const liters = (this.formMezzi.get('liters') as FormArray)
    const liter = liters.at(control);
    liter.setValue(event.target.value);
    LoggingService.log('form Mezzi change', LogLevel.debug, this.formMezzi);
    this.calculateVehiclePrices(control);
  }

  // metodo chiamato alla selezione di un costo al litro del gasolio nel form di creazione del report step 2
  changeVehicleCostPerLiter(event, control) {
    const costs = (this.formMezzi.get('costPerLiter') as FormArray);
    const cost = costs.at(control);
    cost.setValue(event.target.value);
    LoggingService.log('form Mezzi change', LogLevel.debug, this.formMezzi);
    this.calculateVehiclePrices(control);
  }

  // metodo che calcola i costi del mezzo selezionato(costo gasolio e costo totale)
  calculateVehiclePrices(control: number) {
    const vehicles = (this.formMezzi.get('vehicles') as FormArray)
    const vehicle = vehicles.at(control)
    if (vehicle == null) {
      return;
    }
    const dp = (this.formMezzi.get('dailyPrice') as FormArray).at(control).value;
    const lt = (this.formMezzi.get('liters') as FormArray).at(control).value;
    const cpl = (this.formMezzi.get('costPerLiter') as FormArray).at(control).value;
    const fuelTotalPrice = (this.formMezzi.get('fuelTotalPrice') as FormArray).at(control);
    fuelTotalPrice.setValue(Math.round((lt * cpl) * 100) / 100);
    const tot = (this.formMezzi.get('totalPrice') as FormArray).at(control);
    // if (dp == null) {
    //   tot.setValue(lt * cpl);
    //   return;
    // }
    tot.setValue(Math.round((lt * cpl + dp) * 100) / 100); // due cifre decimali
    LoggingService.log('aggiornati costi veicolo', LogLevel.debug, dp);

    this.calculateAllMezziTotalCost();
    this.updateTendineMezziNgSelect();

  }

  // calcolo la somma dei costi totali di tutti i mezzi inseriti
  calculateAllMezziTotalCost() {

    let sum = 0;
    console.log((this.formMezzi.get('totalPrice') as FormArray));
    (this.formMezzi.get('totalPrice') as FormArray).value.forEach(element => {
      sum += element
    });
    console.log('somma costo mezzi', sum);
    this.costoTotaleAllMezzi = sum;
    // aggiorno le tendine di selezione dei mezzi
    this.updateTendineMezziNgSelect();
  }

  // metodo chiamato al click del logo del cestino nel form dei mezzi step 2
  deleteFormMezziElement(i) {
    LoggingService.log('elimina elemento form mezzi', LogLevel.debug, i);
    (this.formMezzi.get('vehicles') as FormArray).removeAt(i);
    (this.formMezzi.get('liters') as FormArray).removeAt(i);
    (this.formMezzi.get('costPerLiter') as FormArray).removeAt(i);
    (this.formMezzi.get('dailyPrice') as FormArray).removeAt(i);
    (this.formMezzi.get('fuelTotalPrice') as FormArray).removeAt(i);
    (this.formMezzi.get('totalPrice') as FormArray).removeAt(i);

    // ricalcolo la somma totale dei costi totali dei mezzi
    this.calculateAllMezziTotalCost();
  }

  // Aggiorna le tendine di selezione dei mezzi in modo da non permettere di selezionare un mezzo già selezionato
  updateTendineMezziNgSelect() {
    const mezzoCounter = (this.formMezzi.get('vehicles') as FormArray).length;
    const allSelected: Mezzo[] = (this.formMezzi.get('vehicles') as FormArray).value;
    this.mezziCantiereNgSelect = [];
    // var list = [];
    for (let i = 0; i < mezzoCounter; i++) {
      const selected: Mezzo = (this.formMezzi.get('vehicles') as FormArray).at(i).value;
      // NON devo scartare il mezzo selezionato, cioè devo lasciarla nella tendina
      const y = this.mezziCantiere.filter(x => (!allSelected.filter(x => x != null).map(z => z.id).includes(x.id))
      );
      // QUESTO BLOCCO DI CODICE COMMENTATO DOVREBBE ESSERE USATO SE VOGLIO MOSTRARE IL MEZZO SELEZIONATO NELLA TENDINA
      // È COMMENTATO PERCHE' NON FUNZIONA
      // if (y.find(x => x.id == selected.id) == null)
      //   y.push(selected);

      this.mezziCantiereNgSelect[i] = y;
    }
  }

  changeDescrizioneAttivita(event, control: number) {
    const activities = (this.formDescrizioneAttivita.get('activities') as FormArray);
    const activity = activities.at(control);
    activity.setValue(event.target.value);
    LoggingService.log('form Descrizione attività change', LogLevel.debug, this.formDescrizioneAttivita);
  }

  cleanSearch(control: number) {
    const prezzari = (this.formDescrizioneAttivita.get('prezziario') as FormArray);
    const prezzario = prezzari.at(control);
    (document.getElementById('typeahead-basic' + control) as HTMLInputElement).value = null;
    prezzario.setValue(null);
    this.listaSearch[control] = [];
  }

  // chiamata alla selezione di un servizio o alla eliminazione dello stesso(step 3)
  changePrezziarioDescrizioneAttivita(event: ServizioCliente, control: number) {

    LoggingService.log('event del form descrizione attività è', LogLevel.debug, event);
    const prezziari = (this.formDescrizioneAttivita.get('prezziario') as FormArray);
    const prezziario = prezziari.at(control);
    const descrizioniAttività = (this.formDescrizioneAttivita.get('activities') as FormArray);
    const descrizioneAttività = descrizioniAttività.at(control);
    if (event) {
      prezziario.setValue(event);
    }
    if (event == undefined) {
      // se entro in questo controllo significa che è stata eliminato il servizio dal menu a tendina
      // svuoto l'unità di misura, il costo unitario ,il costo totale e la categoria
      (this.formDescrizioneAttivita.get('prezziario') as FormArray).at(control).setValue(null);
      (this.formDescrizioneAttivita.get('ums') as FormArray).at(control).setValue(null);
      (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).at(control).setValue(null);
      (this.formDescrizioneAttivita.get('category') as FormArray).at(control).setValue(null);
      (this.formDescrizioneAttivita.get('totalPrice') as FormArray).at(control).setValue(null);

      // (document.getElementById('typeahead-basic') as HTMLInputElement).value=null;
      this.umSelected[control] = '';
      return;
    }

    // prendo i dati in base al servizio selezionato dal menu a tendina
    const um = (this.formDescrizioneAttivita.get('ums') as FormArray).at(control);
    const category = (this.formDescrizioneAttivita.get('category') as FormArray).at(control);
    const unitaryPrice = (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).at(control);
    um.setValue(event.um);
    category.setValue(event.category);
    unitaryPrice.setValue(event.pricePerUm);
    this.calculateTotalPriceServiziOfferti(control);
    LoggingService.log('form Descrizione attività change', LogLevel.debug, this.formDescrizioneAttivita);
  }

  calculateQuantity(i: number) {
    // Retrieve values from input elements and handle null, undefined, or zero cases
    const equalParts = parseFloat((<HTMLInputElement>document.getElementById('equalParts' + i)).value) || 1;
    const length = parseFloat((<HTMLInputElement>document.getElementById('length' + i)).value) || 1;
    const width = parseFloat((<HTMLInputElement>document.getElementById('width' + i)).value) || 1;
    const height = parseFloat((<HTMLInputElement>document.getElementById('height' + i)).value) || 1;

    // Calculate quantity
    const quantityValue = equalParts * length * width * height

    // Update the FormArray
    const quantities = this.formDescrizioneAttivita.get('quantities') as FormArray;
    const quantityControl = quantities.at(i) as FormControl;
    quantityControl.setValue(quantityValue);

    // Call another method to calculate the total price
    this.calculateTotalPriceServiziOfferti(i);
  }

  changeQuantityDescrizioneAttivita(event, control, type?: string) {

    if (event == null && type == 'm³') {
      const altezza = (<HTMLInputElement>document.getElementById('altezza' + control)).value;
      const lunghezza = (<HTMLInputElement>document.getElementById('lunghezza' + control)).value;
      const profondita = (<HTMLInputElement>document.getElementById('profondita' + control)).value;
      const quantities = (this.formDescrizioneAttivita.get('quantities') as FormArray)
      const quantity = quantities.at(control);
      quantity.setValue((Number.parseFloat(altezza) * Number.parseFloat(profondita) * Number.parseFloat(lunghezza)).toString());
      LoggingService.log('quantita', LogLevel.debug, Number.parseFloat(altezza) * Number.parseFloat(profondita) * Number.parseFloat(lunghezza));
      (<HTMLInputElement>document.getElementById('quantity' + control)).value = (Number.parseFloat(altezza) * Number.parseFloat(profondita) * Number.parseFloat(lunghezza)).toString();
      this.calculateTotalPriceServiziOfferti(control);
    }
    if (event == null && type == 'm²') {
      const altezza = (<HTMLInputElement>document.getElementById('altezza' + control)).value;
      const lunghezza = (<HTMLInputElement>document.getElementById('lunghezza' + control)).value;
      const quantities = (this.formDescrizioneAttivita.get('quantities') as FormArray)
      const quantity = quantities.at(control);
      quantity.setValue((Number.parseFloat(altezza) * Number.parseFloat(lunghezza)).toString());
      LoggingService.log('quantita', LogLevel.debug, Number.parseFloat(altezza) * Number.parseFloat(lunghezza));
      (<HTMLInputElement>document.getElementById('quantity' + control)).value = (Number.parseFloat(altezza) * Number.parseFloat(lunghezza)).toString();
      this.calculateTotalPriceServiziOfferti(control);
    }
    if (event != null) {
      const quantities = (this.formDescrizioneAttivita.get('quantities') as FormArray)
      const quantity = quantities.at(control);
      quantity.setValue(event.target.value);
      LoggingService.log('form Descrizione attività change', LogLevel.debug, this.formDescrizioneAttivita);
      this.calculateTotalPriceServiziOfferti(control);
    }
  }

  calculateTotalPriceServiziOfferti(control: number) {
    const formDescrizioneAttivita = this.formDescrizioneAttivita;

    // Recupera i form array
    const prezziari = formDescrizioneAttivita.get('prezziario') as FormArray;
    const unitaryPrices = formDescrizioneAttivita.get('unitaryPrices') as FormArray;
    const quantities = formDescrizioneAttivita.get('quantities') as FormArray;
    const totalPriceArray = formDescrizioneAttivita.get('totalPrice') as FormArray;

    // Verifica se l'indice è valido
    if (control < 0 || control >= prezziari.length) {
      console.error(`Invalid control index: ${control}`);
      return;
    }

    // Recupera i valori dal form array
    const unitaryPrice = unitaryPrices.at(control).value;
    const quantity = quantities.at(control).value;

    // Converti i valori in numeri e calcola il prezzo totale
    const unitaryPriceNum = parseFloat(unitaryPrice);
    const quantityNum = parseFloat(quantity);

    if (isNaN(unitaryPriceNum) || isNaN(quantityNum)) {
      console.error('Invalid unitary price or quantity');
      return;
    }

    const totalPrice = (unitaryPriceNum * quantityNum).toFixed(2);

    // Imposta il valore calcolato nel form array
    totalPriceArray.at(control).setValue(totalPrice);

    // Calcola la somma dei costi totali dei lavori eseguiti
    this.calculateAllLavoriEseguitiTotalCost();
  }

  // calcolo la somma dei costi totali di tutti i mezzi inseriti
  calculateAllLavoriEseguitiTotalCost() {
    debugger;
    let sum = 0;
    console.log((this.formDescrizioneAttivita.get('totalPrice') as FormArray));

    (this.formDescrizioneAttivita.get('totalPrice') as FormArray).value.forEach(element => {
      sum += Number(element) || 0;
    });

    console.log('somma costo lavori eseguiti', sum);
    this.costoTotaleAllLavoriEseguiti = Number.parseFloat(sum.toFixed(2));
    if (Number.isNaN(this.costoTotaleAllLavoriEseguiti)) {
      this.costoTotaleAllLavoriEseguiti = 0;
    }
  }

  // metodo chiamato al click del logo del cestino nello step 3 lavori eseguiti
  deleteFormDescrizioneAttivitaElement(i) {
    LoggingService.log('elimina elemento form descrizione attività', LogLevel.debug, i);
    (this.formDescrizioneAttivita.get('activities') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('prezziario') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('quantities') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('equalParts') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('lengths') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('widths') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('heights') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('ums') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('totalPrice') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('category') as FormArray).removeAt(i);
    (this.formDescrizioneAttivita.get('attachments') as FormArray).removeAt(i);
    this.umSelected[i] = '';
    this.formDataLavoriEseguitiNames.splice(i, 1); // elimino la stringa dei nomi degli allegati in quella posizione
    this.loading.splice(i, 1);
    // ricalcolo la somma dei costi totali dei lavori eseguiti
    this.calculateAllLavoriEseguitiTotalCost();
  }

  // funzione chiamata quando si seleziona un fornitore dal menu a tendina nello step Beni e Servizi
  changeDescriptionFormBeniDiConsumo(event: ServizioFornitore, control, flag?: number) {
    LoggingService.log('event e control sono', LogLevel.debug, [event, control]);
    if (event == undefined) {
      console.log('ho resettato il servizio');
      (document.getElementById('hours' + control) as HTMLInputElement).disabled = true;
      // se entro in questo controllo significa che è stata eliminata la persona dal menu a tendina
      // svuoto i costi orari, il totale e la persona
      (this.formBeniDiConsumo.get('descriptions') as FormArray).at(control).setValue(null);
      // (this.formBeniDiConsumo.get("suppliers") as FormArray).at(control).setValue(null);
      (this.formBeniDiConsumo.get('ums') as FormArray).at(control).setValue(null);
      (this.formBeniDiConsumo.get('unitaryPrices') as FormArray).at(control).setValue(null);
      (this.formBeniDiConsumo.get('totalPrices') as FormArray).at(control).setValue(null);
      (this.formBeniDiConsumo.get('quantities') as FormArray).at(control).setValue(null);
      // solo se ho eliminato il fornitore, elimino anche la lista dei servizi
      if (flag == 1) {
        this.deleteServiziFornitoreBeniDiConsumo(control);
      }
      return;
    }
    const descriptions = (this.formBeniDiConsumo.get('descriptions') as FormArray)
    const description = descriptions.at(control)
    if (event) {
      description.setValue(event);
    }
    const unitaryPrices = (this.formBeniDiConsumo.get('unitaryPrices') as FormArray);
    const up = unitaryPrices.at(control);
    if (event) {
      up.setValue(event.pricePerUM);
    }
    const ums = (this.formBeniDiConsumo.get('ums') as FormArray);
    const um = ums.at(control);
    if (event) {
      um.setValue(event.um);
    }
    const suppliers = (this.formBeniDiConsumo.get('suppliers') as FormArray);
    const supplier = suppliers.at(control);
    let servizio = new Supplier();
    if (event) {
      servizio = this.fornitoriget.find(i => i.id == Number.parseInt(event.idFornitore));
      // prima era servizio.name
      supplier.setValue(servizio);
    }

    // se non ho selezionato alcun servizio disabilito l'input delle quantità
    if (this.formBeniDiConsumo.value.descriptions[control]) {
      (document.getElementById('hours' + control) as HTMLInputElement).disabled = false;
    } else {
      (document.getElementById('hours' + control) as HTMLInputElement).disabled = true;
    }

    this.calculateTotalPriceBeniDiConsumo(control);
    LoggingService.log('form Beni Di Consumo change', LogLevel.debug, this.formBeniDiConsumo);
    // console.error("AAAAAAAAAAA", this.formBeniDiConsumo.value.descriptions[control])
  }

  // metodo chiamato alla selezione di un numero di ore ordinarie lavorate nel form di creazione del report step 1
  changeQuantitiesFormBeniDiConsumo(event, control) {
    const quantities = (this.formBeniDiConsumo.get('quantities') as FormArray)
    const quantity = quantities.at(control);
    quantity.setValue(event.target.value);
    LoggingService.log('form Beni Di Consumo change', LogLevel.debug, this.formBeniDiConsumo);
    this.calculateTotalPriceBeniDiConsumo(control);
  }

  calculateTotalPriceBeniDiConsumo(control: number) {

    const descriptions = (this.formBeniDiConsumo.get('descriptions') as FormArray);
    const description = descriptions.at(control);
    if (description == null) {
      return;
    }
    const unitaryPrices = (this.formBeniDiConsumo.get('unitaryPrices') as FormArray);
    const p = unitaryPrices.at(control).value;
    const quantities = (this.formBeniDiConsumo.get('quantities') as FormArray);
    const q = quantities.at(control).value;
    const totalPrices = (this.formBeniDiConsumo.get('totalPrices') as FormArray);
    const tot = totalPrices.at(control);
    tot.setValue(Math.round(p * Number.parseFloat(q) * 100) / 100); // due cifre decimali
    LoggingService.log('costo totale  bene di consumo xxxxx', LogLevel.debug, [tot, p, q]);

    // calcolo la somma dei costi totali di tutte le provviste inserite
    this.calculateAllBeniDiConsumoTotalCost()

  }

  // calcolo la somma dei costi totali di tutte le provviste
  calculateAllBeniDiConsumoTotalCost() {

    let sum = 0;
    console.log((this.formBeniDiConsumo.get('totalPrices') as FormArray));
    (this.formBeniDiConsumo.get('totalPrices') as FormArray).value.forEach(element => {
      sum += element
    });
    console.log('somma costo provviste', sum);
    this.costoTotaleAllProvviste = sum;
  }

  // metodo chiamato al click del logo del cestino nello step 4 provviste(ex beni e servizi)
  deleteFormBeniDiConsumoElement(i) {
    LoggingService.log('elimina elemento form beni di consumo', LogLevel.debug, i);
    (this.formBeniDiConsumo.get('descriptions') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('quantities') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('suppliers') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('ums') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('unitaryPrices') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('totalPrices') as FormArray).removeAt(i);
    (this.formBeniDiConsumo.get('attachments') as FormArray).removeAt(i);
    this.formDataProvvisteNames.splice(i, 1); // elimino la stringa dei nomi degli allegati in quella posizione

    // ricalcolo la somma dei costi totali di tutte le provviste inserite
    this.calculateAllBeniDiConsumoTotalCost()
  }

  closeForm() {
    // se sono in una modifica di un report, svuoto il sessionStorage
    console.log('Inizio chiusura form, Attualmente il flag di modify consiste in:', this.reportModifyFlag);
    this.photos = []
    if (this.reportModifyFlag.modify) {
      localStorage.removeItem('formPersonale');
      localStorage.removeItem('formMezzi');
      localStorage.removeItem('formDescrizioneAttivita');
      localStorage.removeItem('formBeniDiConsumo');
      localStorage.removeItem('formAllegatiEDomande');

      // QUESTO LO SI DEVE MODIFICARE A TERMINE DI LAST PHASE NON QUI
      this.reportModifyFlag.modify = false;
      // this.reportModifyFlag.modify_closed = true;
      // chiudo il popup
      this.modalService.dismissAll();
      return;
    }
    // chiudo il popup
    this.modalService.dismissAll();
    // STUPENDO
    localStorage.setItem('formPersonale', JSON.stringify(this.formPersonale.value));
    localStorage.setItem('formMezzi', JSON.stringify(this.formMezzi.value));
    localStorage.setItem('formDescrizioneAttivita', JSON.stringify(this.formDescrizioneAttivita.value));
    localStorage.setItem('formBeniDiConsumo', JSON.stringify(this.formBeniDiConsumo.value));
    localStorage.setItem('formAllegatiEDomande', JSON.stringify(this.formAllegatieDomande.value));

    localStorage.setItem('idCantiereCheckReport', this.targetCantiereId.toString());

    // svuoto i formarray
    // (this.formPersonale.get("employees") as FormArray).clear();
    // (this.formPersonale.get("hours") as FormArray).clear();
    // (this.formPersonale.get("extraordinaryHours") as FormArray).clear();
    // (this.formPersonale.get("travelHours") as FormArray).clear();
    // (this.formPersonale.get("ordinaryCost") as FormArray).clear();
    // (this.formPersonale.get("extraordinaryCost") as FormArray).clear();
    // (this.formPersonale.get("travelHoursCost") as FormArray).clear();
    // (this.formPersonale.get("totalCost") as FormArray).clear();

    // (this.formMezzi.get("vehicles") as FormArray).clear();
    // (this.formMezzi.get("liters") as FormArray).clear();
    // (this.formMezzi.get("costPerLiter") as FormArray).clear();
    // (this.formMezzi.get("dailyPrice") as FormArray).clear();
    // (this.formMezzi.get("fuelTotalPrice") as FormArray).clear();
    // (this.formMezzi.get("totalPrice") as FormArray).clear();

    // (this.formDescrizioneAttivita.get("activities") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("prezziario") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("quantities") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("ums") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("unitaryPrices") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("totalPrice") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("category") as FormArray).clear();
    // (this.formDescrizioneAttivita.get("attachments") as FormArray).clear();

    // (this.formBeniDiConsumo.get("descriptions") as FormArray).clear();
    // (this.formBeniDiConsumo.get("suppliers") as FormArray).clear();
    // (this.formBeniDiConsumo.get("quantities") as FormArray).clear();
    // (this.formBeniDiConsumo.get("ums") as FormArray).clear();
    // (this.formBeniDiConsumo.get("unitaryPrices") as FormArray).clear();
    // (this.formBeniDiConsumo.get("totalPrices") as FormArray).clear();
    // (this.formBeniDiConsumo.get("attachments") as FormArray).clear();

    // //reinizializzo il form
    // (this.formPersonale.get("employees") as FormArray).push(new FormControl(''));
    // (this.formPersonale.get("hours") as FormArray).push(new FormControl());
    // (this.formPersonale.get("extraordinaryHours") as FormArray).push(new FormControl());
    // (this.formPersonale.get("travelHours") as FormArray).push(new FormControl());
    // (this.formPersonale.get("ordinaryCost") as FormArray).push(new FormControl());
    // (this.formPersonale.get("extraordinaryCost") as FormArray).push(new FormControl());
    // (this.formPersonale.get("travelHoursCost") as FormArray).push(new FormControl());
    // (this.formPersonale.get("totalCost") as FormArray).push(new FormControl());

    // (this.formMezzi.get("vehicles") as FormArray).push(new FormControl(''));
    // (this.formMezzi.get("liters") as FormArray).push(new FormControl());
    // (this.formMezzi.get("costPerLiter") as FormArray).push(new FormControl());
    // (this.formMezzi.get("dailyPrice") as FormArray).push(new FormControl());
    // (this.formMezzi.get("fuelTotalPrice") as FormArray).push(new FormControl());
    // (this.formMezzi.get("totalPrice") as FormArray).push(new FormControl());

    // (this.formDescrizioneAttivita.get("activities") as FormArray).push(new FormControl(''));
    // (this.formDescrizioneAttivita.get("prezziario") as FormArray).push(new FormControl(''));
    // (this.formDescrizioneAttivita.get("quantities") as FormArray).push(new FormControl(0));
    // (this.formDescrizioneAttivita.get("ums") as FormArray).push(new FormControl(0));
    // (this.formDescrizioneAttivita.get("unitaryPrices") as FormArray).push(new FormControl());
    // (this.formDescrizioneAttivita.get("totalPrice") as FormArray).push(new FormControl());
    // (this.formDescrizioneAttivita.get("category") as FormArray).push(new FormControl());
    // (this.formDescrizioneAttivita.get("attachments") as FormArray).push(new FormControl());

    // (this.formBeniDiConsumo.get("descriptions") as FormArray).push(new FormControl());
    // (this.formBeniDiConsumo.get("suppliers") as FormArray).push(new FormControl());
    // (this.formBeniDiConsumo.get("quantities") as FormArray).push(new FormControl());
    // (this.formBeniDiConsumo.get("ums") as FormArray).push(new FormControl());
    // (this.formBeniDiConsumo.get("unitaryPrices") as FormArray).push(new FormControl());
    // (this.formBeniDiConsumo.get("totalPrices") as FormArray).push(new FormControl());
    // (this.formDescrizioneAttivita.get("attachments") as FormArray).push(new FormControl());

    // var user = JSON.parse(localStorage.getItem('form'));
    // LoggingService.log("scarico dal local storage", LogLevel.debug, user);

  }

  // metodo chiamato quando viene aggiunto un file nello step finale
  addFileToReport(event) {
    // imposto ric a true in modo da far comparire il bottone per ricaricare la lista
    this.ric = true;
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

  // metodo che elimina i file allegati al report nello step finale
  deleteAttachmentReport() {

    // svuoto effetticamente l'input file per evitare che non mi carichi lo stesso file selezionato in precedenza

    const element = document.getElementById('inputGroupFile03') as HTMLInputElement;
    if (element) {
      element.value = null;
    }

    this.fileName = '';
    this.formData = new FormData();
  }

  ricarica(control: number) {
    (this.formBeniDiConsumo.get('descriptions') as FormArray).at(control).setValue('');
    (this.formBeniDiConsumo.get('suppliers') as FormArray).at(control).setValue(null);
    this.deleteServiziFornitoreBeniDiConsumo(control);
    // scarico tutti i servizi di tutti i fornitori. Poi elimino i servizi dei fornitori non inerenti a questo cantiere
    this.spinner.show('spinner2',
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#fcfc03', // colore icona che si muove
        fullScreen: false
      });
    this.fornitoriService.getAllServizi()
      .subscribe(
        (res) => {
          LoggingService.log('beni e servizi RIottenuti', LogLevel.debug, res);
          this.serviziget = res;
        },
        (err) => {
          LoggingService.log('ERRORE get beni e servizi', LogLevel.error, err);

        },
        () => {
          this.discardServizi();
          setTimeout(() => {
            this.spinner.hide('spinner2');
            swal.fire({
              icon: 'success',
              title: 'Fatto!',
              showClass: {
                popup: 'animated tada'
              },
              timer: 1000,
              text: 'Lista aggiornata',
              customClass: {
                confirmButton: 'btn btn-success'
              },
            });
            // rinascondo il bottone della ricarica
            this.ric = false;

          }, 1500);
        },
      )

  }

  triggerFileInputClick(index: number) {
    const fileInput = document.getElementById(`inputGroupFile01${index}`) as HTMLInputElement;
    fileInput.click();
  }


  attachmentsManagerModal?: NgbModalRef;

  openAttachmentsManager(content) {

    this.attachmentsManagerModal = this.modalService.open(content, {
      size: 'xl', scrollable: true, keyboard: false, backdrop: 'static', fullscreen: true
    });
  }

  //funzione chiamata quando si aggiungono uno o piu allegati nello step 3 o 4

  addFileToNota(event: any, index: number, type: string) {
    const files: FileList = event.target.files;
    LoggingService.log('file caricato', LogLevel.debug, event);

    if (!files || files.length === 0) {
      return;
    }

    // Clear previous file names
    if (type === 'provviste') {
      this.formDataProvvisteNames[index] = [];
    } else if (type === 'lavoriEseguiti') {
      this.formDataLavoriEseguitiNames[index] = [];
    } else {
      LoggingService.log('errore aggiunta allegato', LogLevel.error);
      return;
    }

    const formFilesArray = [];

    // Append files to an array (not directly to FormData)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      formFilesArray.push(file);
    }

    // Update form control with files
    const attachmentsControl = (type === 'provviste') ? this.formBeniDiConsumo.get('attachments') as FormArray : this.formDescrizioneAttivita.get('attachments') as FormArray;
    attachmentsControl.at(index).setValue(formFilesArray);

    // Update file names for display
    const fileNames = Array.from(files).map(file => file.name);
    if (type === 'provviste') {
      this.formDataProvvisteNames[index] = fileNames;
    } else if (type === 'lavoriEseguiti') {
      this.formDataLavoriEseguitiNames[index] = fileNames;
    }

    LoggingService.log('element è', LogLevel.debug, attachmentsControl.value[index]);
  }

  deleteAttachmentNote(index: number, type: string) {
    switch (type) {
      case 'provviste': {
        // Clear file input
        const fileInput = document.getElementById('inputGroupFile02') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.formDataProvvisteNames[index] = [];
        (this.formBeniDiConsumo.get('attachments') as FormArray).at(index).setValue([]);
        break;
      }
      case 'lavoriEseguiti': {
        // Clear file input
        const fileInput = document.getElementById('inputGroupFile01') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }

        this.formDataLavoriEseguitiNames[index] = [];
        (this.formDescrizioneAttivita.get('attachments') as FormArray).at(index).setValue([]);
        break;
      }
      default: {
        LoggingService.log('errore delete attachment nomi', LogLevel.error);
        break;
      }
    }

    LoggingService.log('le stringhe sono', LogLevel.debug, this.formDataLavoriEseguitiNames);
  }

  // chiamato quando viene salvata o cancellata una firma
  getSignature(event: string) {
    console.log('firma', event);
    // se viene cancellata la firma event sarà =''
    this.firma = event;
  }

  // funzione chiamata quando si termina il report per CREARE O MODIFICARE
  printForm(reportStatus: ReportStatus = ReportStatus.ToBeApproved) {
    this.modalService.dismissAll();
    LoggingService.log('report intero', LogLevel.debug,
      [
        this.formPersonale.value,
        this.formMezzi.value,
        this.formDescrizioneAttivita.value,
        this.formBeniDiConsumo.value,
        this.formAllegatieDomande.value,
        this.firma
      ]);

    // ho estrapolato i file raccolti nel report perchè verranno postati separatamente
    this.filesLavoriEseguiti = [...this.formDescrizioneAttivita.value.attachments];
    this.filesProvviste = [...this.formBeniDiConsumo.value.attachments];
    this.filesAllegatiEQuestionario = this.formData.getAll('formFiles') as File[];
    console.log('FILESSSS', this.filesLavoriEseguiti);
    console.log('FILESSSS', this.filesProvviste);
    console.log('FILESSSS', this.filesAllegatiEQuestionario);

    // elimino i file dal report poichè li ho messi da parte
    (this.formDescrizioneAttivita.get('attachments') as FormArray).clear();
    this.formDataLavoriEseguitiNames = [];

    (this.formBeniDiConsumo.get('attachments') as FormArray).clear();
    this.formDataProvvisteNames = [];
    this.deleteAttachmentReport();

    console.log('Elenco di tutti gli attachments inseriti nel report', this.filesLavoriEseguiti, this.filesProvviste, this.filesAllegatiEQuestionario);

    LoggingService.log('report intero dopo aver messo da parte i file', LogLevel.debug,
      [
        this.formPersonale.value,
        this.formMezzi.value,
        this.formDescrizioneAttivita.value,
        this.formBeniDiConsumo.value,
        this.formAllegatieDomande.value
      ]);
    // salvo i dati del report ad eccezione degli attachments sul local storage
    localStorage.setItem('formPersonale', JSON.stringify(this.formPersonale.value));
    localStorage.setItem('formMezzi', JSON.stringify(this.formMezzi.value));
    localStorage.setItem('formDescrizioneAttivita', JSON.stringify(this.formDescrizioneAttivita.value));
    localStorage.setItem('formBeniDiConsumo', JSON.stringify(this.formBeniDiConsumo.value));
    localStorage.setItem('formAllegatiEDomande', JSON.stringify(this.formAllegatieDomande.value));

    // preparo i modelli da passare al backend
    this.lastPhase(reportStatus);
  }

  // funzione chiamata ogni qual volta si modifica la larghezza della finestra del browser
  onResize(event) {
    this.screenWidth = event.target.innerWidth;
  }

  // chiamata ogni volta che si apre il popup del report
  // chiamata ogni volta che si apre il popup del report
  async checkOldData() {
    // reimposto il personale
    this.ngOnInit();

    const idCantiereReportSaved = localStorage.getItem('idCantiereCheckReport');
    if (!this.reportModifyFlag.modify) {
      if (!idCantiereReportSaved || Number.parseInt(idCantiereReportSaved) != this.targetCantiereId) {
        this.reinizializzaFormPersonale();
        this.reinizializzaFormMezzi();
        this.reinizializzaFormBeniDiConsumo();
        this.reinizializzaFormDescrizioneAttivita();
        this.reinizializzaFormAllegatiEDomande();
        return;
      }
    }

    let jObj = localStorage.getItem('formPersonale');
    let formPersonale = null;

    if (jObj) {
      formPersonale = JSON.parse(jObj);
    }

    if (formPersonale != null && formPersonale.employees.length > 0) {
      this.reinizializzaFormPersonale();
      for (let i = 0; i < formPersonale.employees.length; i++) {

        if ((i == formPersonale.employees.length - 1) && formPersonale.employees[i] == null) {
          console.log(this.formPersonale.value);
          break;
        }

        (this.formPersonale.get('employees') as FormArray).at(i).setValue(formPersonale.employees[i]);
        (this.formPersonale.get('hours') as FormArray).at(i).setValue((formPersonale.hours[i] as string)?.replace(',', '.'));
        (this.formPersonale.get('extraordinaryHours') as FormArray).at(i).setValue((formPersonale.extraordinaryHours[i] as string)?.replace(',', '.'));
        (this.formPersonale.get('ordinaryCost') as FormArray).at(i).setValue(formPersonale.ordinaryCost[i]);
        (this.formPersonale.get('extraordinaryCost') as FormArray).at(i).setValue(formPersonale.extraordinaryCost[i]);
        (this.formPersonale.get('travelHoursCost') as FormArray).at(i).setValue(formPersonale.travelHoursCost[i]);
        (this.formPersonale.get('travelHours') as FormArray).at(i).setValue((formPersonale.travelHours[i] as string)?.replace(',', '.'));
        (this.formPersonale.get('totalCost') as FormArray).at(i).setValue(formPersonale.totalCost[i]);


        (this.formPersonale.get('ordinaryAmount') as FormArray).at(i).setValue(formPersonale.ordinaryAmount[i]);
        (this.formPersonale.get('extraordinaryAmount') as FormArray).at(i).setValue(formPersonale.extraordinaryAmount[i]);
        (this.formPersonale.get('travelAmount') as FormArray).at(i).setValue(formPersonale.travelAmount[i]);
        (this.formPersonale.get('absenceHours') as FormArray).at(i).setValue(formPersonale.absenceHours[i]);
        (this.formPersonale.get('absenceReasons') as FormArray).at(i).setValue(formPersonale.absenceReasons[i]);

        // aggiungo il nuovo input solo se l'ultimo elemento dell'array non è nullo, perchè se è nullo significa
        // che c'è già un input vuoto in cui scrivere
        console.log(this.formPersonale.value)
        if ((i == formPersonale.employees.length - 1) && formPersonale.employees[formPersonale.employees.length - 1] != null) {
          this.addInputFormPersonale();
          console.log(this.formPersonale.value)
          break;
        }
        this.addInputFormPersonale();
        console.log(this.formPersonale.value)
      }
    } else {
      this.reinizializzaFormPersonale();
    }

    console.warn('FormPersonaleprecompilato', formPersonale);
    console.log(this.formPersonale.value);
    // reimposto i mezzi
    jObj = localStorage.getItem('formMezzi');
    let formMezzi = null;

    if (jObj) {
      formMezzi = JSON.parse(jObj);
    }

    if (formMezzi != null && formMezzi.vehicles.length > 0) {
      this.reinizializzaFormMezzi();
      for (let i = 0; i < formMezzi.vehicles.length; i++) {
        if ((i == formMezzi.vehicles.length - 1) && formMezzi.vehicles[i] == null) {
          break;
        }
        (this.formMezzi.get('vehicles') as FormArray).at(i).setValue(formMezzi.vehicles[i]);
        (this.formMezzi.get('liters') as FormArray).at(i).setValue(formMezzi.liters[i]);
        (this.formMezzi.get('costPerLiter') as FormArray).at(i).setValue(formMezzi.costPerLiter[i]);
        (this.formMezzi.get('dailyPrice') as FormArray).at(i).setValue(formMezzi.dailyPrice[i]);
        (this.formMezzi.get('fuelTotalPrice') as FormArray).at(i).setValue(Math.round(formMezzi.fuelTotalPrice[i] * 100) / 100);
        (this.formMezzi.get('totalPrice') as FormArray).at(i).setValue(Math.round(formMezzi.totalPrice[i] * 100) / 100);
        // aggiungo il nuovo input solo se l'ultimo elemento dell'array non è nullo, perchè se è nullo significa
        // che c'è già un input vuoto in cui scrivere
        if (i == formMezzi.vehicles.length - 1 && formMezzi.vehicles[formMezzi.vehicles.length - 1] != null) {
          this.addInputFormMezzi();
          break;
        }
        this.addInputFormMezzi();
      }

    } else {
      this.reinizializzaFormMezzi();
    }

    // reimposto i lavori eseguiti(descrizione attività)
    jObj = localStorage.getItem('formDescrizioneAttivita');
    let formDescrizioneAttivita = null;

    if (jObj) {
      formDescrizioneAttivita = JSON.parse(jObj);
    }

    if (formDescrizioneAttivita != null && formDescrizioneAttivita.prezziario.length > 0) {
      this.reinizializzaFormDescrizioneAttivita();
      for (let i = 0; i < formDescrizioneAttivita.prezziario.length; i++) {
        if ((i == formDescrizioneAttivita.prezziario.length - 1) && formDescrizioneAttivita.prezziario[i] == null) {
          continue;
        }
        (this.formDescrizioneAttivita.get('activities') as FormArray).at(i).setValue(formDescrizioneAttivita.activities[i]);
        (this.formDescrizioneAttivita.get('prezziario') as FormArray).at(i).setValue(formDescrizioneAttivita.prezziario[i]);
        (this.formDescrizioneAttivita.get('quantities') as FormArray).at(i).setValue(formDescrizioneAttivita.quantities[i]);
        (this.formDescrizioneAttivita.get('equalParts') as FormArray).at(i).setValue(formDescrizioneAttivita.equalParts[i]);
        (this.formDescrizioneAttivita.get('lengths') as FormArray).at(i).setValue(formDescrizioneAttivita.lengths[i]);
        (this.formDescrizioneAttivita.get('widths') as FormArray).at(i).setValue(formDescrizioneAttivita.widths[i]);
        (this.formDescrizioneAttivita.get('heights') as FormArray).at(i).setValue(formDescrizioneAttivita.heights[i]);
        (this.formDescrizioneAttivita.get('ums') as FormArray).at(i).setValue(formDescrizioneAttivita.ums[i]);
        (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).at(i).setValue(formDescrizioneAttivita.unitaryPrices[i]);
        (this.formDescrizioneAttivita.get('category') as FormArray).at(i).setValue(formDescrizioneAttivita.category[i]);
        (this.formDescrizioneAttivita.get('totalPrice') as FormArray).at(i).setValue(Math.round(formDescrizioneAttivita.totalPrice[i] * 100) / 100);
        (this.formDescrizioneAttivita.get('attachments') as FormArray).at(i).setValue(null);

        // aggiungo il nuovo input solo se l'ultimo elemento dell'array non è nullo, perchè se è nullo significa
        // che c'è già un input vuoto in cui scrivere
        if (i == formDescrizioneAttivita.prezziario.length - 1 && formDescrizioneAttivita.prezziario[formDescrizioneAttivita.prezziario.length - 1] != null) {
          this.addInputFormDescrizioneAttivita();
          continue
        }
        this.addInputFormDescrizioneAttivita();
      }
    } else {
      this.reinizializzaFormDescrizioneAttivita();
    }

    // reimposto le provviste(beni di consumo)
    jObj = localStorage.getItem('formBeniDiConsumo');
    let formBeniDiConsumo = null;
    if (jObj) {
      formBeniDiConsumo = JSON.parse(jObj);
    }

    if (formBeniDiConsumo != null && formBeniDiConsumo.suppliers.length > 0) {
      this.reinizializzaFormBeniDiConsumo();
      for (let i = 0; i < formBeniDiConsumo.suppliers.length; i++) {
        if ((i == formBeniDiConsumo.suppliers.length - 1) && formBeniDiConsumo.suppliers[i] == null) {
          continue;
        }
        (this.formBeniDiConsumo.get('descriptions') as FormArray).at(i).setValue(formBeniDiConsumo.descriptions[i]);
        (this.formBeniDiConsumo.get('suppliers') as FormArray).at(i).setValue(formBeniDiConsumo.suppliers[i]);
        (this.formBeniDiConsumo.get('quantities') as FormArray).at(i).setValue((formBeniDiConsumo.quantities[i] as string)?.replace(',', '.'));
        (this.formBeniDiConsumo.get('ums') as FormArray).at(i).setValue(formBeniDiConsumo.ums[i]);
        (this.formBeniDiConsumo.get('unitaryPrices') as FormArray).at(i).setValue(formBeniDiConsumo.unitaryPrices[i]);
        (this.formBeniDiConsumo.get('totalPrices') as FormArray).at(i).setValue(formBeniDiConsumo.totalPrices[i]);
        (this.formBeniDiConsumo.get('attachments') as FormArray).at(i).setValue(null);

        // popolo la tendina dei servizi di tutti i fornitori
        setTimeout(() => {
          this.tendinaProvviste();
        }, 3000);

        if (i == formBeniDiConsumo.suppliers.length - 1 && formBeniDiConsumo.suppliers[formBeniDiConsumo.suppliers.length - 1] != null) {
          this.addInputFormBeniDiConsumo();
          continue;
        }
        this.addInputFormBeniDiConsumo();
      }

    } else {
      this.reinizializzaFormBeniDiConsumo();
    }

    // reimposto lo step degli allegati e domande
    jObj = localStorage.getItem('formAllegatiEDomande');
    let formAllegatiEDomande = null;

    if (jObj) {
      formAllegatiEDomande = JSON.parse(jObj);
    }

    if (formAllegatiEDomande != null) {
      this.reinizializzaFormAllegatiEDomande();
      console.warn('FormAllegatieDomandePrecompilato', formAllegatiEDomande);
      (this.formAllegatieDomande.get('meteo') as FormControl).setValue(formAllegatiEDomande.meteo);
      (this.formAllegatieDomande.get('mezzi') as FormControl).setValue(formAllegatiEDomande.mezzi);
      (this.formAllegatieDomande.get('fornitori') as FormControl).setValue(formAllegatiEDomande.fornitori);
      (this.formAllegatieDomande.get('risorseUmane') as FormControl).setValue(formAllegatiEDomande.risorseUmane);
      (this.formAllegatieDomande.get('commentiMeteo') as FormControl).setValue(formAllegatiEDomande.commentiMeteo);
      (this.formAllegatieDomande.get('commentiAttrezzatureMezzi') as FormControl).setValue(formAllegatiEDomande.commentiAttrezzatureMezzi);
      (this.formAllegatieDomande.get('commentiFornitori') as FormControl).setValue(formAllegatiEDomande.commentiFornitori);
      (this.formAllegatieDomande.get('commentiRisorseUmane') as FormControl).setValue(formAllegatiEDomande.commentiRisorseUmane);
      (this.formAllegatieDomande.get('commenti') as FormControl).setValue(formAllegatiEDomande.commenti);
    } else {
      this.reinizializzaFormAllegatiEDomande();
    }
  }

  reinizializzaFormPersonale() {

    (this.formPersonale.get('employees') as FormArray).clear();
    (this.formPersonale.get('hours') as FormArray).clear();
    (this.formPersonale.get('extraordinaryHours') as FormArray).clear();
    (this.formPersonale.get('travelHours') as FormArray).clear();
    (this.formPersonale.get('ordinaryCost') as FormArray).clear();
    (this.formPersonale.get('extraordinaryCost') as FormArray).clear();
    (this.formPersonale.get('travelHoursCost') as FormArray).clear();
    (this.formPersonale.get('totalCost') as FormArray).clear();
    (this.formPersonale.get('absenceHours') as FormArray).clear();
    (this.formPersonale.get('absenceReasons') as FormArray).clear();

    (this.formPersonale.get('employees') as FormArray).push(new FormControl());
    (this.formPersonale.get('hours') as FormArray).push(new FormControl());
    (this.formPersonale.get('extraordinaryHours') as FormArray).push(new FormControl());
    (this.formPersonale.get('ordinaryCost') as FormArray).push(new FormControl());
    (this.formPersonale.get('extraordinaryCost') as FormArray).push(new FormControl());
    (this.formPersonale.get('travelHoursCost') as FormArray).push(new FormControl());
    (this.formPersonale.get('travelHours') as FormArray).push(new FormControl());
    (this.formPersonale.get('totalCost') as FormArray).push(new FormControl());
    (this.formPersonale.get('absenceHours') as FormArray).push(new FormControl());
    (this.formPersonale.get('absenceReasons') as FormArray).push(new FormControl());

  }

  reinizializzaFormMezzi() {
    (this.formMezzi.get('vehicles') as FormArray).clear();
    (this.formMezzi.get('liters') as FormArray).clear();
    (this.formMezzi.get('costPerLiter') as FormArray).clear();
    (this.formMezzi.get('dailyPrice') as FormArray).clear();
    (this.formMezzi.get('fuelTotalPrice') as FormArray).clear();
    (this.formMezzi.get('totalPrice') as FormArray).clear();

    (this.formMezzi.get('vehicles') as FormArray).push(new FormControl());
    (this.formMezzi.get('liters') as FormArray).push(new FormControl());
    const fc = new FormControl();
    fc.setValue(this.defaultGasPrice);
    (this.formMezzi.get('costPerLiter') as FormArray).push(fc);
    (this.formMezzi.get('dailyPrice') as FormArray).push(new FormControl());
    (this.formMezzi.get('fuelTotalPrice') as FormArray).push(new FormControl());
    (this.formMezzi.get('totalPrice') as FormArray).push(new FormControl());

  }

  reinizializzaFormDescrizioneAttivita() {
    (this.formDescrizioneAttivita.get('activities') as FormArray).clear();
    (this.formDescrizioneAttivita.get('prezziario') as FormArray).clear();
    (this.formDescrizioneAttivita.get('quantities') as FormArray).clear();
    (this.formDescrizioneAttivita.get('equalParts') as FormArray).clear();
    (this.formDescrizioneAttivita.get('lengths') as FormArray).clear();
    (this.formDescrizioneAttivita.get('widths') as FormArray).clear();
    (this.formDescrizioneAttivita.get('heights') as FormArray).clear();
    (this.formDescrizioneAttivita.get('ums') as FormArray).clear();
    (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).clear();
    (this.formDescrizioneAttivita.get('totalPrice') as FormArray).clear();
    (this.formDescrizioneAttivita.get('category') as FormArray).clear();
    (this.formDescrizioneAttivita.get('attachments') as FormArray).clear();
    this.formDataLavoriEseguitiNames = [];
    this.loading = [];

    (this.formDescrizioneAttivita.get('activities') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('prezziario') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('quantities') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('equalParts') as FormArray).push(new FormControl(1));
    (this.formDescrizioneAttivita.get('lengths') as FormArray).push(new FormControl(0));
    (this.formDescrizioneAttivita.get('widths') as FormArray).push(new FormControl(0));
    (this.formDescrizioneAttivita.get('heights') as FormArray).push(new FormControl(0));
    (this.formDescrizioneAttivita.get('ums') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('unitaryPrices') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('totalPrice') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('category') as FormArray).push(new FormControl());
    (this.formDescrizioneAttivita.get('attachments') as FormArray).push(new FormControl());

    this.loading.push(false);

  }

  reinizializzaFormBeniDiConsumo() {
    (this.formBeniDiConsumo.get('descriptions') as FormArray).clear();
    (this.formBeniDiConsumo.get('suppliers') as FormArray).clear();
    (this.formBeniDiConsumo.get('quantities') as FormArray).clear();
    (this.formBeniDiConsumo.get('ums') as FormArray).clear();
    (this.formBeniDiConsumo.get('unitaryPrices') as FormArray).clear();
    (this.formBeniDiConsumo.get('totalPrices') as FormArray).clear();
    (this.formBeniDiConsumo.get('attachments') as FormArray).clear();
    this.formDataProvvisteNames = [];

    (this.formBeniDiConsumo.get('descriptions') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('suppliers') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('quantities') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('ums') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('unitaryPrices') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('totalPrices') as FormArray).push(new FormControl());
    (this.formBeniDiConsumo.get('attachments') as FormArray).push(new FormControl());
  }

  reinizializzaFormAllegatiEDomande() {
    this.formAllegatieDomande = new FormGroup({
      meteo: new FormControl(),
      mezzi: new FormControl(),
      fornitori: new FormControl(),
      risorseUmane: new FormControl(),
      commentiMeteo: new FormControl(),
      commentiAttrezzatureMezzi: new FormControl(),
      commentiFornitori: new FormControl(),
      commentiRisorseUmane: new FormControl(),
      commenti: new FormControl()
    });

    this.deleteAttachmentReport();
  }

  reinizializzaInteroForm() {
    swal.fire({
      title: 'Vuoi reinizializzare il report?',
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
        this.reinizializzaFormPersonale();
        this.reinizializzaFormMezzi();
        this.reinizializzaFormBeniDiConsumo();
        this.reinizializzaFormDescrizioneAttivita();
        this.reinizializzaFormAllegatiEDomande();
        this.photos = []
        this.firma = '';
      }
    })
  }

  /**
   *
   * Chiamata quando si termina un report: CREAZIONE O MODIFICA
   */
  lastPhase(reportStatus: ReportStatus = ReportStatus.ToBeApproved) {
    console.log('Inizio last phase, Attualmente il flag di modify consiste in:', this.reportModifyFlag);
    const personale = new PersonaleReportModel();
    personale.employees = this.formPersonale.value.employees;
    personale.extraordinaryCost = this.formPersonale.value.extraordinaryCost;
    personale.extraordinaryHours = this.formPersonale.value.extraordinaryHours.map(x => x?.toString());
    personale.hours = this.formPersonale.value.hours.map(x => x?.toString());
    personale.ordinaryCost = this.formPersonale.value.ordinaryCost;
    personale.totalCost = this.formPersonale.value.totalCost;
    personale.travelHours = this.formPersonale.value.travelHours.map(x => x?.toString());
    personale.travelHoursCost = this.formPersonale.value.travelHoursCost;
    personale.absenceHours = this.formPersonale.value.absenceHours;
    personale.absenceReasons = this.formPersonale.value.absenceReasons;

    console.log('personale', personale);

    const mezzi = new VehiclesReportModel();
    mezzi.vehicles = [];
    this.formMezzi.value.vehicles.forEach(mezzo => {
      if (mezzo) {
        mezzi.vehicles.push(mezzo.mezzo);
      }
    });

    console.warn('mezzi pushati', mezzi.vehicles)
    const length = mezzi.vehicles.length;
    // taglio tutti gli array perchè considero solo dove il mezzo non è nullo
    mezzi.costPerLiter = this.formMezzi.value.costPerLiter;
    mezzi.costPerLiter = mezzi.costPerLiter.splice(0, length);
    mezzi.costPerLiter = mezzi.costPerLiter.map(item => item === '' || item == null ? '0' : item);
    mezzi.dailyPrice = this.formMezzi.value.dailyPrice;
    mezzi.dailyPrice = mezzi.dailyPrice.splice(0, length);
    mezzi.fuelTotalPrice = this.formMezzi.value.fuelTotalPrice;
    mezzi.fuelTotalPrice = mezzi.fuelTotalPrice.splice(0, length);
    mezzi.liters = this.formMezzi.value.liters;
    mezzi.liters = mezzi.liters.splice(0, length);
    mezzi.liters = mezzi.liters.map(item => item === '' || item == null ? '0' : item);
    mezzi.totalPrice = this.formMezzi.value.totalPrice;
    mezzi.totalPrice = mezzi.totalPrice.splice(0, length);

    console.log('Mezzi', mezzi);

    console.log('Lavori Eseguiti Form', this.formDescrizioneAttivita);
    const lavoriEseguiti = new LavoriEseguitiReportModel()
    lavoriEseguiti.activities = this.formDescrizioneAttivita.value.activities;
    lavoriEseguiti.category = this.formDescrizioneAttivita.value.category;
    lavoriEseguiti.prezziario = this.formDescrizioneAttivita.value.prezziario;
    lavoriEseguiti.quantities = this.formDescrizioneAttivita.value.quantities.map(x => x?.toString());
    lavoriEseguiti.equalParts = this.formDescrizioneAttivita.value.equalParts;
    lavoriEseguiti.lengths = this.formDescrizioneAttivita.value.lengths;
    lavoriEseguiti.widths = this.formDescrizioneAttivita.value.widths;
    lavoriEseguiti.heights = this.formDescrizioneAttivita.value.heights;
    lavoriEseguiti.totalPrice = this.formDescrizioneAttivita.value.totalPrice;
    lavoriEseguiti.ums = this.formDescrizioneAttivita.value.ums;
    lavoriEseguiti.unitaryPrices = this.formDescrizioneAttivita.value.unitaryPrices;

    console.log('Lavori Eseguiti', lavoriEseguiti);

    const provviste = new ProvvisteReportModel();
    provviste.descriptions = this.formBeniDiConsumo.value.descriptions;
    provviste.quantities = this.formBeniDiConsumo.value.quantities;
    provviste.suppliers = this.formBeniDiConsumo.value.suppliers;
    provviste.totalPrice = this.formBeniDiConsumo.value.totalPrices;
    provviste.ums = this.formBeniDiConsumo.value.ums;
    provviste.unitaryPrices = this.formBeniDiConsumo.value.unitaryPrices;

    console.log('Provviste', provviste);

    const allegatiEDomande = new AllegatiEQuestionarioReportModel();
    allegatiEDomande.commenti = this.formAllegatieDomande.value.commenti;
    allegatiEDomande.commentiAttrezzatureMezzi = this.formAllegatieDomande.value.commentiAttrezzatureMezzi;
    allegatiEDomande.commentiFornitori = this.formAllegatieDomande.value.commentiFornitori;
    allegatiEDomande.commentiMeteo = this.formAllegatieDomande.value.commentiMeteo;
    allegatiEDomande.commentiRisorseUmane = this.formAllegatieDomande.value.commentiRisorseUmane;
    allegatiEDomande.fornitori = this.formAllegatieDomande.value.fornitori;
    allegatiEDomande.meteo = this.formAllegatieDomande.value.meteo;
    allegatiEDomande.mezzi = this.formAllegatieDomande.value.mezzi;
    allegatiEDomande.risorseUmane = this.formAllegatieDomande.value.risorseUmane;

    console.log('Allegati e domande', allegatiEDomande);

    const report = new ReportModel();
    report.personale = personale;
    report.mezzi = mezzi;
    report.lavoriEseguiti = lavoriEseguiti;
    report.provviste = provviste;
    report.allegatiEQuestionario = allegatiEDomande;
    report.author = this.user;
    report.signature = this.firma;
    report.status = reportStatus;
    // ogni volta che viene approvato viene aggiornato l'autore di approvazione e la data
    if (reportStatus == ReportStatus.Approved) {
      report.approvalDate = new Date();
      report.approvalAuthor = this.user;
    }

    // scrivo la data nel modo corretto
    const pipe = new DataPipe();
    this.referenceDate = pipe.transform(this.referenceDate);

    report.referenceDate = this.referenceDate; // data di riferimento report nell'ultimo step

    console.log('Report', report);
    // CREAZIONE REPORT
    console.log('Termine last phase, Attualmente il flag di modify consiste in:', this.reportModifyFlag);
    if (!this.reportModifyFlag || !this.reportModifyFlag.modify) {
      this.createReport(report);
    } else {
      this.updateReport(report);
    }

  }

  // per creazione report
  createReport(report: ReportModel) {
    this.spinner.show('spinner2',
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    this.cantieriservice.postReportDiCantiere(report, this.targetCantiereId).subscribe(
      (res: reportShortModel) => {

        console.warn('report di cantiere postato con successo', res);
        // if (this.filesLavoriEseguiti[0])
        this.postaAttachmentsReport(res.id, 'LavoriEseguiti', this.filesLavoriEseguiti);
        // if (this.filesProvviste[0])
        this.postaAttachmentsReport(res.id, 'Provviste', this.filesProvviste);
        // if (this.filesAllegatiEQuestionario[0])
        // allegati e questionario è gestito in maniera leggermente diversa(non è un array di array)
        this.postaAttachmentsReport(res.id, 'AllegatiEQuestionario', [this.filesAllegatiEQuestionario]);

        this.renameAndPushPhotos(res.id)
      },
      (err) => {
        console.error('ERRORE POST REPORT DI CANTIERE', err);
        this.spinner.hide('spinner2');
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Il report non è stato creato',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      },
    )
  }

  updateReport(report: ReportModel) {

    this.spinner.show('spinner2',
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });
    console.log('Inizio updateReport, Attualmente il flag di modify consiste in:', this.reportModifyFlag);
    this.cantieriservice.updateReportDiCantiere(report, this.targetCantiereId, this.reportModifyFlag.reportId).subscribe(
      (res: reportShortModel) => {

        console.warn('report di cantiere postato con successo', res);
        // if (this.filesLavoriEseguiti[0])
        this.postaAttachmentsReport(this.reportModifyFlag.reportId, 'LavoriEseguiti', this.filesLavoriEseguiti);
        // if (this.filesProvviste[0])
        this.postaAttachmentsReport(this.reportModifyFlag.reportId, 'Provviste', this.filesProvviste);
        // if (this.filesAllegatiEQuestionario[0])
        // allegati e questionario è gestito in maniera leggermente diversa(non è un array di array)
        this.postaAttachmentsReport(this.reportModifyFlag.reportId, 'AllegatiEQuestionario', [this.filesAllegatiEQuestionario]);

        this.renameAndPushPhotos(this.reportModifyFlag.reportId)

      },
      (err) => {
        console.error('ERRORE UPDATE REPORT DI CANTIERE', err);
        this.spinner.hide('spinner2');
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Il report non è stato aggiornato',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      },
    )
  }

  renameAndPushPhotos(reportId: number) {

    let foto: File[] = []
    for (let f of this.photos) {
      foto.push(new File([f], `${f.filename}.${f.ext}`, { type: f.type }))
    }

    this.postaAttachmentsReport(reportId, 'Foto', foto);
  }

  postaAttachmentsReport(idReport: number, reportTypeFile: string, files) {

    console.warn('file passati', files);

    let formData = new FormData();
    //sono array di array di files

    let file_added = false;
    for (const array of files) {
      if (array) {
        if (Array.isArray(array)) {
          for (let file of array) {
            if (file) {
              console.log(file);
              formData.append('formFiles', file);
              if (!file_added) {
                file_added = true;
              }

            }
          }
        } else {
          console.log(array);
          formData.append('formFiles', array);
          if (!file_added) {
            file_added = true;
          }
        }
      }
    }
    if (file_added == false) {
      console.log('No Attachments da postare');
      this.spinner.hide('spinner2');
      if (reportTypeFile == 'AllegatiEQuestionario') {
        swal.fire({
          icon: 'success',
          title: 'Fatto!',
          text: 'Il report è stato creato con successo. La pagina verrà ricaricata.',
          customClass: {
            confirmButton: 'btn btn-success'
          },
        }).then(() => {
          location.reload();
        })
      }
    }
    LoggingService.log('formdata', LogLevel.debug, formData.getAll('formFiles'));
    this.cantieriservice.postReportAttachments(this.targetCantiereId, idReport, formData, reportTypeFile).subscribe(
      (res) => {
        console.log('attachments di' + reportTypeFile + 'postati', res);

        this.spinner.hide('spinner2');
        if (reportTypeFile == 'AllegatiEQuestionario') {
          swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: !this.reportModifyFlag.modify ? 'Il report è stato creato con successo. La pagina verrà ricaricata.' : 'Il report è stato aggiornato con successo. La pagina verrà ricaricata.',
            customClass: {
              confirmButton: 'btn btn-success'
            },
          }).then(() => {
            // ho concluso l'update del report
            // svuoto il sessionStorage
            this.closeForm();

            this.reportModifyFlag.modify = false; // Va inserito qua poichè le richieste sono sincrone e azzrarlo fuori dalla funzione significherebbe ammazzarlo
            this.reportModifyFlag.reportId = null; // Questo può dare un brutto problema di inconsistenza in casi di richieste troppo veloci

            // ricarico la pagina
            location.reload();
          })
        }
      },
      (err) => {
        console.error('ERRORE POST attachments di' + reportTypeFile, err);
        this.spinner.hide();
        swal.fire({
          icon: 'error',
          title: 'C\'è stato un problema!',
          text: 'Il report non è stato creato',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      },
    )

  }

  tendinaProvviste() {
    const listaServizi: ServizioFornitore[] = [];
    this.serviziSingleFornitore = [];

    for (let i = 0; i < this.formBeniDiConsumo.value.suppliers.length; i++) {
      if ((this.formBeniDiConsumo.get('suppliers') as FormArray).at(i).value) {
        this.serviziget.forEach(element => {
          if (Number.parseInt(element.idFornitore) == (this.formBeniDiConsumo.get('suppliers') as FormArray).at(i).value.id) {
            listaServizi.push(element);
          }
        });
        this.serviziSingleFornitore[i] = listaServizi;
      }

      // se non ho selezionato alcun servizio disabilito l'input delle quantità
      if ((this.formBeniDiConsumo.get('descriptions') as FormArray).at(i).value) {
        (document.getElementById('hours' + i) as HTMLInputElement).disabled = false;
      } else {
        (document.getElementById('hours' + i) as HTMLInputElement).disabled = true;
      }
    }
  }

  // chiamata quando si vuole scaricare un allegato di un report dalla tabella
  downloadAttachment(file: _File) {
    const authHeaders = this._auth.retrieveHeaders();
    this._http.get(file.url + '/' + file.id,
      { headers: authHeaders, observe: 'body', responseType: 'arraybuffer' })
      .subscribe(
        (res: any) => {
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob([res], { type: file.type }));
          downloadLink.download = file.fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          window.URL.revokeObjectURL(downloadLink.href);
          document.body.removeChild(downloadLink);
        },
        (err) => {
          console.error(err);
        }
      );

  }

  // chiamata al'eliminazione di un report dalla tabella
  deleteReportDiCantiere(row: reportShortModel) {
    LoggingService.log('ho premuto il tasto del cestino', LogLevel.debug, event);
    const str = 'Elimina il report selezionato';
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
            this.cantieriservice.deleteReportDiCantiere(row.idCantiere, row.id).subscribe(
              (res) => {
                console.log('ELiminato un report di cantiere', res);
                this.reportCantiere.splice(this.reportCantiere.findIndex(e => e.id == row.id), 1);
                this.reportCantiere = [...this.reportCantiere];
                swal.fire({
                  icon: 'success',
                  title: 'Fatto!',
                  text: 'Il report è stato eliminato',
                  customClass: {
                    confirmButton: 'btn btn-success'
                  },
                })
              },
              (err) => {
                console.error('Errore eliminazione report di cantiere', err);
                swal.fire({
                  icon: 'error',
                  title: 'C\'è stato un problema!',
                  text: 'Il report non è stato eliminato',
                  customClass: {
                    confirmButton: 'btn btn-danger'
                  }
                });
              },
            )
          }
        })
      }
    })

    LoggingService.log('Danilozzo zzozzo', LogLevel.debug, ret);
  }

  // chiamata quando nello step dei LAVORI ESEGUITI si filtra un rif. Articolo Prezzario
  searchArticoloPrezzario(event, index: number) {

    console.log(event);
    // console.log(this.rifArticolo);

    // var term = (document.getElementById('rifArticolo' + index)) as unknown as ElementRef;
    // console.log(term.nativeElement);
    if (event.term.length > 3) {
      this.loading[index] = true;
      this.servizicliente.cercaArticoloPrezzario(this.cantiere.contratto.prezzari_id, (event.term ? event.term : null)).subscribe(
        (res) => {
          console.log('search ok', res);
          this.prezziario = res;
          this.prezziario = [...this.prezziario];
          this.cdr.detectChanges();
        },
        (err) => {
          console.error('errore search', err);
          this.loading[index] = false
        },
        () => {
          this.loading[index] = false
        }
      )
    } else {
      this.prezziario = [];
      this.prezziario = [...this.prezziario];
      this.loading[index] = false;
    }
  }

  search2(index) {
    console.log('search2', index, this.searchString);
    this.searchString[index] = (document.getElementById('typeahead-basic' + index) as HTMLInputElement).value;

    // controllo la relativa checkbox del codice tariffa
    const e = (document.getElementById('checkbox' + index) as HTMLInputElement);
    // console.warn("COD TARIFFA checkbox", e.checked);
    let rateCode = false;
    if (e && e.checked) {
      rateCode = true;
    }
    // if (this.searchString.length > 3) {
    if (this.searchString.length >= 0) {
      this.loading[index] = true;
      this.servizicliente.cercaArticoloPrezzario(this.cantiere.contratto.prezzari_id, (this.searchString[index] ? this.searchString[index] : null), rateCode).subscribe(
        (res) => {
          console.log('search ok', res);
          this.listaSearch[index] = res.splice(0, 100);
          this.listaSearch[index] = [...this.listaSearch[index]];
          this.cdr.detectChanges();
        },
        (err) => {
          console.error('errore search', err);
          this.loading[index] = false
        },
        () => {
          this.loading[index] = false
        }
      )
    } else {
      this.listaSearch[index] = [];
      this.listaSearch[index] = [...this.listaSearch[index]];
      this.loading[index] = false;
    }
  }

  /**
   *
   * @param event elemento selezionato(input html)
   * @param i riga del report
   * @param index id dell'elemento selezionato dalla lista. Se id==4, allora è il 5° elemento della lista
   */
  listClicked(event, index: number, i: number) {

    console.log('numero elemento nella lista, numero riga nel report', index, i);
    console.log('input', document.getElementById('typeahead-basic') as HTMLInputElement);

    const elem = this.listaSearch[i][event.target.id];
    console.log('elem', elem);
    if (elem) {
      this.changePrezziarioDescrizioneAttivita(elem, i);
    }
  }

  /////////////////////////////////////// fine testing////////////////////////////////

  ///////////////////////////////////// modifica report//////////////////////////////
  modifyReportDiCantiere(report: reportShortModel, content, isADuplicate = false) {
    this.spinner.show('spinner2',
      {
        type: 'ball-fall',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
        color: '#1898d6', // colore icona che si muove
        fullScreen: true
      });

    this.cantieriservice.getReportFullSpec(report.idCantiere, report.id).subscribe(
      (res) => {
        console.log('modifyReportDiCantiere', res);
        // setto il flag di modifica del report a true;
        console.log('Funzione di modifica report, Attualmente il flag di modify consiste in:', this.reportModifyFlag);
        if (!isADuplicate) {
          this.reportModifyFlag.modify = true;
          this.reportModifyFlag.reportId = report.id;
        }
        // this.reportModifyFlag.modify_closed = false;

        const aeq: AllegatiEQuestionarioReportModel = res.allegatiEQuestionario;
        const author: string = res.author;
        const lavoriEseguiti: LavoriEseguitiReportModel = {
          activities: res.lavoriEseguiti.activities,
          category: res.lavoriEseguiti.category,
          prezziario: res.lavoriEseguiti.prezziario,
          quantities: res.lavoriEseguiti.quantities,
          equalParts: res.lavoriEseguiti.equalParts,
          lengths: res.lavoriEseguiti.lengths,
          widths: res.lavoriEseguiti.widths,
          heights: res.lavoriEseguiti.heights,
          totalPrice: res.lavoriEseguiti.totalPrice,
          ums: res.lavoriEseguiti.ums,
          unitaryPrices: res.lavoriEseguiti.unitaryPrices
        };
        const mezzi: VehiclesReportModel = {
          costPerLiter: res.mezzi.costPerLiter,
          dailyPrice: res.mezzi.dailyPrice,
          fuelTotalPrice: res.mezzi.fuelTotalPrice,
          liters: res.mezzi.liters,
          totalPrice: res.mezzi.totalPrice,
          vehicles: res.mezzi.vehicles
        };

        mezzi.vehicles.forEach(element => {
          // element.mezzo = res.mezzi.vehicles;
          element.mezzo.fullDescription = element.mezzo.description + ' ' + element.mezzo.brand + ' ' + element.mezzo.model + ' ' + element.mezzo.licensePlate;
        })

        const personale: PersonaleReportModel = res.personale;
        personale.employees.forEach(element => {
          element.fullName = element.name + ' ' + element.surname;
        });
        const provviste: ProvvisteReportModel = res.provviste;

        if (res.referenceDate) {
          // var d = Date.parse(res.referenceDate);
          // var dateMomentObject = moment(res.referenceDate, "DD-MM-YYYY");
          // this.referenceDate = dateMomentObject.toDate().toISOString().substring(0, 10);
          // this.referenceDate = res.referenceDate.substring(6, 10) + '-' + res.referenceDate.substring(3, 5) + '-' + res.referenceDate.substring(0, 2);
          const ddd = res.referenceDate.toString().split('-');
          this.referenceDate = ddd[2] + '-' + ddd[1] + '-' + ddd[0];
          console.log(this.referenceDate);
        }

        // var referenceDate = res.referenceDate;
        const signature = res.signature;

        // chiudo il popup
        this.modalService.dismissAll();
        // STUPENDO
        localStorage.setItem('formPersonale', JSON.stringify(personale));
        localStorage.setItem('formMezzi', JSON.stringify(mezzi));
        localStorage.setItem('formDescrizioneAttivita', JSON.stringify(lavoriEseguiti));
        localStorage.setItem('formBeniDiConsumo', JSON.stringify(provviste));
        localStorage.setItem('formAllegatiEDomande', JSON.stringify(aeq));
        // cotrollo se nel localstorage c'è della roba in modo da popolare il report

        this.checkOldData().then(() => {

          setTimeout(() => {
            this.spinner.hide('spinner2');
            this.modalService.open(content, {
              size: 'xl', scrollable: true, keyboard: true, backdrop: 'static', fullscreen: true
            })
            // .dismissed.subscribe(
            //   (res) => {
            //     console.log("Sono in un dismissed, Attualmente il flag di modify consiste in:", this.reportModifyFlag);
            //     if (this.reportModifyFlag.modify_closed == false) {
            //       this.closeForm();
            //       console.log("Ho chiuso il form, Attualmente il flag di modify consiste in:", this.reportModifyFlag);
            //     }
            //   },
            // )

          }, 2000);

        })
          .catch((e) => {
            console.error('checkolddata fallito', e);
            this.spinner.hide('spinner1');
          })
        // this.report = res;
        // this.report = [...this.report];
        this.cdr.detectChanges();
      },
      (err) => {
        console.error('errore modifyReportDiCantiere', err);
        this.spinner.hide('spinner1');
      }
    )
  }

  // funzione chiamata quando si vuole eliminare un allegato da un record di tabella
  removeAttachment(allegato: _File, idreport: number) {
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


                  var reportIndex = this.reportCantiere.findIndex(x => x.id === idreport);

                  var index = this.reportCantiere[reportIndex].allegatiLavoriEseguiti.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {

                    this.reportCantiere[reportIndex].allegatiLavoriEseguiti.splice(index, 1);
                  }

                  index = this.reportCantiere[reportIndex].allegatiProvviste.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.reportCantiere[reportIndex].allegatiProvviste.splice(index, 1);
                  }

                  index = this.reportCantiere[reportIndex].allegatiDomande.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.reportCantiere[reportIndex].allegatiDomande.splice(index, 1);
                  }

                  index = this.reportCantiere[reportIndex].foto.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.reportCantiere[reportIndex].foto.splice(index, 1);
                  }

                  index = this.selectedReport.allegatiLavoriEseguiti.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.selectedReport.allegatiLavoriEseguiti.splice(index, 1);
                  }

                  index = this.selectedReport.allegatiProvviste.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.selectedReport.allegatiProvviste.splice(index, 1);
                  }

                  index = this.selectedReport.allegatiDomande.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.selectedReport.allegatiDomande.splice(index, 1);
                  }

                  index = this.selectedReport.foto.findIndex(x => x.id === allegato.id);
                  if (index !== -1) {
                    this.selectedReport.foto.splice(index, 1);
                  }

                },
              )
          }
        })
      }
    })
  }

  /**
   * Creazione rapida personale
   * @param content
   */
  employeesQuickCreation(content) {
    console.log('veloceee', content);
    this.personaleQuickCreation = this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
   * Chiamata quando il personale è stato creato dal quick form
   * @param event
   */
  async personaleAddedQuickForm(event: boolean) {
    this.personaleQuickCreation.close();
    if (event) {
      // una volta chiuso il modale, riscarico il personale
      await this.ScaricaAllPersonale();
    }
  }

  /**
   * Creazione rapida personale
   * @param content
   */
  mezzoQuickCreation(content) {
    console.log('veloceee', content);
    this.mezzoQuickCreationTemplate = this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
   * Chiamata quando il mezzo è stato creato dal quick form
   * @param event
   */
  async mezzoAddedQuickForm(event: boolean) {
    this.mezzoQuickCreationTemplate.close();
    if (event) {
      // una volta chiuso il modale, riscarico i mezzi
      await this.ScaricaAllMezzi(this.transformMezzoToListaMezziDiCantiere);
    }
  }

  /**
   * Creazione rapida personale
   * @param content
   */
  fornitoreQuickCreation(content) {
    console.log('veloceee', content);
    this.fornitoreQuickCreationTemplate = this.modalService.open(content, { size: 'lg', centered: true });
  }

  /////////////////////////////////////////////////////////////////////////////////
  /**
   * Chiamata quando il mezzo è stato creato dal quick form
   * @param event
   */
  async fornitoreAddedQuickForm(event: boolean) {
    this.fornitoreQuickCreationTemplate.close();
    if (event) {
      // una volta chiuso il modale, riscarico i fornitori
      await this.ScaricaAllFornitori();
      await this.ScaricaAllServiziFornitori();
    }
  }

  /**
   * Creazione rapida personale
   * @param content
   */
  serviziFornitoreQuickCreation(content) {
    console.log('veloceee', content);
    this.fornitoreQuickCreationTemplate = this.modalService.open(content, { size: 'lg', centered: true });
  }

  /**
   * Chiamata quando il mezzo è stato creato dal quick form
   * @param event
   */
  async serviziFornitoreAddedQuickForm(event: boolean, index: number) {
    this.fornitoreQuickCreationTemplate.close();
    if (event) {
      // una volta chiuso il modale, riscarico i servizi e aggiorno la tendina
      await this.ScaricaAllServiziFornitori();

      const arr = (this.formBeniDiConsumo.get('suppliers') as FormArray).controls;
      const fornitore: Supplier = structuredClone(arr[index].value);

      for (let index = 0; index < arr.length; index++) {
        const form: Supplier = arr[index].value;
        // aggiorno le tendine dei servizi correlate a questo fornitore per cui
        // è stato aggiunto un nuovo servizio
        if (form.id == fornitore.id) {
          this.serviziFornitoreBeniDiConsumo(fornitore, index);
        }
      }

    }
  }

  articoloPrezzarioQuickCreation(content) {
    this.articoloPrezzarioQuickCreationTemplate = this.modalService.open(content, { size: 'lg', centered: true });
  }

  articoloPrezzarioAddedQuickForm() {
    this.articoloPrezzarioQuickCreationTemplate.close();
  }

  ////////////////////////////////////////////////////////////////

  /// convert a date string dd-mm-yyyy to yyyy-mm-dd
  convertDate(inputDate: string): string {
    const [day, month, year] = inputDate.split('-');
    return `${year}-${month}-${day}`;
  }



  openAggregaModal(row?: reportShortModel) {


    if (row != null) {
      // Se abbiamo una referenceDate specificata significa che vogliamo scaricare un report di un specifico giorno
      debugger
      if (row.referenceDate != '' && row.id != 0) {
        console.log(row);
        this.idReport = row.id;
        this.startDateAggrega = this.convertDate(row.referenceDate);
        this.endDateAggrega = this.convertDate(row.referenceDate);
      }
    } else {
      this.idReport = 0;
    }

    const reportSingolo: boolean = row != null && row != undefined;

    this.modalService.open(this.aggregaModalContent).result.then(
      (result) => {
        if (result === 'pdf') {
          this.exportService.reportSomma(this.idReport, this.startDateAggrega, this.endDateAggrega, 'pdf', this.cantiere, this.mostraCosti, this.mostraRicavi, this.mostraFoto, this.reportCompleto, reportSingolo);
        } else if (result === 'xlsx') {
          this.exportService.reportSomma(this.idReport, this.startDateAggrega, this.endDateAggrega, 'xlsx', this.cantiere, this.mostraCosti, this.mostraRicavi, this.mostraFoto, this.reportCompleto, reportSingolo);
        }
      },
      (reason) => {
        if (reason === 'pdf') {
          this.exportService.reportSomma(this.idReport, this.startDateAggrega, this.endDateAggrega, 'pdf', this.cantiere, this.mostraCosti, this.mostraRicavi, this.mostraFoto, this.reportCompleto, reportSingolo);
        } else if (reason === 'xlsx') {
          this.exportService.reportSomma(this.idReport, this.startDateAggrega, this.endDateAggrega, 'xlsx', this.cantiere, this.mostraCosti, this.mostraRicavi, this.mostraFoto, this.reportCompleto, reportSingolo);
        }
      }
    );
  }

  confirmDate(type: 'pdf' | 'xlsx') {
    if (type === 'pdf') {
      this.modalService.dismissAll('pdf');
    } else if (type === 'xlsx') {
      this.modalService.dismissAll('xlsx');
    }
  }

  reportRowsStyle(row: reportShortModel) {
    return {
      'draftReport': row.status == ReportStatus.Draft,
      'approved': row.status == ReportStatus.Approved
    }
  }

  nextStep() {
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  async checkIfUserCanApproveReport(): Promise<boolean> {
    try {
      const res: Personale[] = await firstValueFrom(this.cantieriservice.getPMsCantiere(this.cantiere.id));

      LoggingService.log('pm cantiere ottenuto', LogLevel.debug, res);

      let pmsCantiere: Personale[];
      if (res && res.length > 0) {
        pmsCantiere = res;
      } else {
        return false;
      }

      if (!pmsCantiere || pmsCantiere.length == 0 || !pmsCantiere.some(x => x.email?.trim() != '')) {
        return false;
      }
      // controllo se l'utente loggato coincide con uno dei PM. Effettuo una chiamata per ogni PM
      const res1 = await Promise.all(pmsCantiere.map(x => firstValueFrom(this.servicepersonale.checkPersonaleEmail(x.email))));
      this.canApproveReport = res1.some(x => x == true) || this._auth.isAdmin();
      return this.canApproveReport;

    } catch (err) {
      LoggingService.log('errore durante la verifica del PM Cantiere', LogLevel.error, err);
      return false;
    }
  }

  fileBrowseHandler(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;

      const lastDotIndex = item.name.lastIndexOf('.');

      if (lastDotIndex !== -1) {
        // Nome del file senza estensione
        item.filename = item.name.substring(0, lastDotIndex);
        // Estensione del file
        item.ext = item.name.substring(lastDotIndex + 1);
      } else {
        // Se non c'è un punto nel nome del file, significa che non c'è estensione
        item.filename = item.name;
        item.ext = '';
      }

      this.photos.push(item);
      const reader = new FileReader();

      // Legge il contenuto del file come Data URL
      reader.onload = (e) => {
        item.imgSrc = e.target?.result;  // Salva il Data URL in `imgSrc`
      };

      reader.readAsDataURL(item);  // Converte il file in Data URL
    }
  }

}
