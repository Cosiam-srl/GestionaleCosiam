import {ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
// const data: any = require('../../../shared/data/chartist.json');
// import * as chartsData from '../../../shared/data/chartjs';
import {AuthService} from 'app/shared/auth/auth.service';
import {AvanzamentoTemporaleCantiere, Cantiere} from 'app/models/cantiere.model';
import {CantieriService} from 'app/shared/services/data/cantieri.service';
import {Note} from 'app/models/note.model';
import {reportShortModel} from 'app/shared/components/report/report.component';
import {NgxSpinnerService} from 'ngx-spinner';
import {FinancialCardService} from 'app/shared/services/data/financialCard.service';
import {PdfService} from '../../../shared/services/pdf.service';

declare var require: any;

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  colors: string[],
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[],
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels,
  stroke: ApexStroke,
  grid: ApexGrid,
  legend?: ApexLegend,
  tooltip?: ApexTooltip,
  plotOptions?: ApexPlotOptions,
  labels?: string[],
  fill: ApexFill,
  markers?: ApexMarkers,
  theme: ApexTheme,
  responsive: ApexResponsive[]
}

// colori grafico ECONOMICO
const $infoEC = '#2F8BE6', $info_lightEC = '#000000';
const themeColorsEC = [$infoEC, $info_lightEC];
//////////////
// colori grafico FINANZIARIO
const $infoFIN = '#2F8BE6', $info_lightFIN = '#000000';
const themeColorsFIN = [$infoFIN, $info_lightFIN];

//////////////
@Component({
  selector: 'app-main-dashboard',
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MainDashboardComponent implements OnInit {

  cantieriList: Cantiere[] = [];
  dateFrom: string = null;
  dateTo: string = null;

  // usati per la tabella in dati finanziari
  avanzamentoTemporale = new AvanzamentoTemporaleCantiere();
  avanzamentoProduzione = 0;
  avanzamentoProduzionePerc = 0;
  finalAmount = 0;
  cantieri: Cantiere[];
  cantieriId: number[];

  progress1 = 120; // Percentuale per la prima barra
  progress2 = 100; // Percentuale per la seconda barra
  ///////////////////////////////////////

  // popolato quando dalla tabella cantieri viene selezionato un cantiere
  cantiereSelected = null;
  @ViewChild('test') test: any;

  // note
  // array che contiene le ultime 5 note del cantiere
  notes: Note[] = [];
  // profitto
  profitto: number;
  // cashflow
  cashFlow: number;

  costi = 0;
  costiPerc = 0;
  ricavi = 0;
  margine = 0;
  marginePerc = 0;

  oreCantieri: { oreOrdinarie: number, oreStraordinarie: number, oreSpostamento: number };
  costiCantieri: { costiManodopera: number, costiMezzi: number, costiMateriali: number };

  dataInizioLavori?: Date

  giorniRimanentiDaEstimatedEnd? = 0
  giorniTrascorsi? = 0
  giorniResidui? = 0
  fineLavori?: Date

  constructor(private pdf: PdfService,
              public authService: AuthService,
              private _cantieriService: CantieriService,
              private _datiFinanziariService: FinancialCardService,
              private _cdr: ChangeDetectorRef,
              private _spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    this.cantieri = [];
    this.cantieriId = [];

    // this.cantiere.id = 6180;
    this._cantieriService.getCantieri().subscribe(
      (res) => {
        // scarico i cantieri
        this.cantieriList = [...res];
        // if (this.cantieriList.length > 0)
        //   //per default seleziono nella tendina dei cantieri il primo cantiere della lista
        //   this.cantieri = [ ...this.cantieriList ];
        this._cdr.detectChanges();
      },
      (err) => {
        console.error('Errore get lista cantieri', err);
      },
    )
    this._cantieriService.getAllNotesByPriority().subscribe(
      (res) => {
        this.notes = [...res];
        console.log('note', res);
      },
      (err) => {
        console.error('Errore get note per priorità', err);
      },
    )
  }

  handleTotali(totali: { costi: number, ricavi: number, margine: number }) {

    if (this.cantieri.length === 1) {
      this.dataInizioLavori = this.cantieri[0].start;
      this.giorniRimanentiDaEstimatedEnd = this.datediff(this.cantieri[0].start, this.cantieri[0].estimatedEnding)
      this.fineLavori = this.getDataFineLavori(this.cantieri[0])
    }

    let costiIniziali = 0
    this.giorniResidui = 0
    this.giorniTrascorsi = 0

    this.cantieri.forEach(cantiere => {
      if (cantiere.costiIniziali) {
        costiIniziali += cantiere.costiIniziali
      }

      // calcolo le infomazione dei giorni

      let r = this.datediff(new Date(), this.getDataFineLavori(cantiere))

      if (r > 0) {
        this.giorniResidui += r
      }

      this.giorniTrascorsi += this.datediff(cantiere.start, new Date())

    });

    let ricaviIniziali = 0

    this.cantieri.forEach(cantiere => {
      if (cantiere.ricaviIniziali) {
        ricaviIniziali += cantiere.ricaviIniziali
      }
    });

    this.costi = totali.costi + costiIniziali;
    this.ricavi = totali.ricavi + ricaviIniziali;
    this.costiPerc = (this.costi / this.ricavi) * 100;
    this.margine = this.ricavi - this.costi;
    this.marginePerc = (this.margine / this.ricavi) * 100;
  }

  changeParams() {
    console.log('CHANGE PARAMS', this.cantieri, this.dateFrom, this.dateTo);

    this.cantieriId = this.cantieri.map(({id}) => id);
    // console.log("cantieriId", this.cantieriId);
    this.getAvanzamentoProduzione();
    this.getAvanzamentoTemporale();
    // this.getProfitto();
    // this.getCashflow()
    this.fetchOreCantieri();
    this.fetchCostiCantieri();
  }

  datediff(start: Date, end: Date) {

    if (!(start instanceof Date)) {
      start = new Date(start)

    }
    if (!(end instanceof Date)) {
      end = new Date(end)

    }

    const Difference_In_Time =
      end.getTime() - start.getTime();

    return Math.round
    (Difference_In_Time / (1000 * 3600 * 24));
  }

  getDataFineLavori(cantiere: Cantiere) {

    const valAdd = cantiere.valoriAggiuntivi

    let fine = new Date(cantiere.estimatedEnding).getTime()

    valAdd.forEach((el) => {
      if (el.additionalSolarDays && el.additionalSolarDays > 0) {
        fine += el.additionalSolarDays * 86400000
      }
    })

    return new Date(fine);

  }

  // Funzione per ottenere le ore dei cantieri
  fetchOreCantieri(): void {
    this._cantieriService.getOreCantieri(this.cantieriId, this.dateFrom, this.dateTo).subscribe(
      data => {
        this.oreCantieri = data;
        console.log('Ore Cantieri:', this.oreCantieri);
      },
      error => {
        console.error('Errore nel recupero delle ore dei cantieri:', error);
      }
    );
  }

  // Funzione per ottenere i costi dei cantieri
  fetchCostiCantieri(): void {
    this._cantieriService.getCostiMezziManodoperaMaterialiCantieri(this.cantieriId, this.dateFrom, this.dateTo).subscribe(
      data => {
        this.costiCantieri = data;
        console.log('Costi Cantieri:', this.costiCantieri);
      },
      error => {
        console.error('Errore nel recupero dei costi dei cantieri:', error);
      }
    );
  }

  getAvanzamentoTemporale() {
    // scarico l'avanzamento temporale in modo da inserirlo nella card dei dati finanziari
    this.avanzamentoTemporale = new AvanzamentoTemporaleCantiere();
    this.cantieri.forEach(cantiere => {

      if (cantiere.valoriAggiuntivi) {
        for (const a of cantiere.valoriAggiuntivi) {

          const s = new AvanzamentoTemporaleCantiere();
          s.totalDays = a.additionalSolarDays

          this.avanzamentoTemporale.sumAvanzamento(s);

        }
      }

      this._cantieriService.getAvanzamentoTemporale(cantiere.id).subscribe(
        (res) => {

          console.log('avanzamento temporale ottenuto', res);
          this.avanzamentoTemporale.sumAvanzamento(res);
        },
        (err) => {
          console.log('ERRORE avanzamento temporale ', err);
        },
        () => {
        }
      )
      this.avanzamentoTemporale.sumPerc(cantiere.ricaviIniziali);

    });
    this._cdr.detectChanges();
  }

  getAvanzamentoProduzione() {
    // scarico l'avanzamento produzione
    this.avanzamentoProduzione = 0;
    this.avanzamentoProduzionePerc = 0;
    this.finalAmount = 0;
    this.cantieri.forEach(cantiere => {
      this._cantieriService.getAvanzamentoProduzione(cantiere.id).subscribe(
        (res) => {
          console.log('avanzamento produzione ottenuto', res);
          // arrotondo
          this.avanzamentoProduzione += Number.parseFloat(res.toFixed(3));
          // cantiere.finalAmount = Number.parseFloat(cantiere.finalAmount.toFixed(3));
          if (cantiere.finalAmount) {
            this.avanzamentoProduzionePerc += ((this.avanzamentoProduzione / cantiere.finalAmount) * 100);
            this.finalAmount += cantiere.finalAmount;
          }

        },
        (err) => {
          console.error('ERRORE get avanzamento produzione', err);
        },
        () => {
          this.avanzamentoProduzionePerc = Number.parseFloat(this.avanzamentoProduzionePerc.toFixed(2));
          this._cdr.detectChanges();
        }
      )
    });

  }

  // scarica i report del cantiere selezionato compresi tra le due date e calcola il profitto
  getProfitto() {
    this.profitto = 0;
    this.cantieri.forEach(cantiere => {
      this._cantieriService.getReportDiCantiere(cantiere.id, null, this.dateFrom, this.dateTo).subscribe(
        (res: reportShortModel[]) => {
          console.warn('Lista di report per questo cantiere scaricata', res);
          res.forEach(element => {
            this.profitto += element.margine;
          });
        },
        (err) => {
          console.error('Errore get lista report per questo cantiere', err);
        },
        () => {
          this.profitto = Math.round(this.profitto * 100) / 100; // arrotondo a 2 cifre decimali
          this._cdr.detectChanges();
        }
      )
    });

  }

  getCashflow() {
    this.cashFlow = 0;
    this.cantieri.forEach(cantiere => {
      this._datiFinanziariService.getCashFlow(cantiere.id).subscribe(
        (res) => {
          this.cashFlow += res;
          this.cashFlow = Math.round(this.cashFlow * 100) / 100; // arrotondo a 2 cifre decimali
        },
        (err) => {
          console.error('errore get cashflow', err)
        },
        () => {
          this._cdr.detectChanges()
        }
      )

    });
  }

  // Line chart configuration Ends
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

  getProgressWidth(progress: number): number {
    return Math.min(100, progress);
  }

  getOverflowWidth(progress: number): number {
    return progress > 100 ? progress - 100 : 0;
  }

  downloadPdf() {
    this.pdf.downloadPDF('dashboard-pdf', `dashboard`, null, this._spinner, "landscape")
  }
}

