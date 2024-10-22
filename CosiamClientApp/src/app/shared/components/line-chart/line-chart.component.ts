import {ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output} from '@angular/core';
import {CantieriService} from 'app/shared/services/data/cantieri.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexResponsive,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import {reportShortModel} from '../report/report.component';
import * as moment from 'moment';
import 'moment/locale/it';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient} from '@angular/common/http';
import {AuthService} from 'app/shared/auth/auth.service';
import {PdfService} from '../../services/pdf.service';
import {LoggingService, LogLevel} from '../../services/logging/logging.service';
import {Cantiere} from '../../../models/cantiere.model';

export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  tooltip: ApexTooltip;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  theme: ApexTheme;
  responsive: ApexResponsive[];
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() cantieriId: number[];
  @Input() height: number;
  @Input() dateFrom: string;
  @Input() dateTo: string;
  @Output() totali = new EventEmitter<{ costi: number, ricavi: number, margine: number }>();

  lineChartOptions: Partial<ChartOptions> = null;
  costi = [];
  ricavi = [];
  margine = [];
  referenceDate = [];
  ids = [];
  private allReports: reportShortModel[] = [];
  private totaliValori = {costi: 0, ricavi: 0, margine: 0};

  pdfExport = inject(PdfService);
  private cantiere: Cantiere;

  constructor(private _cantieriService: CantieriService, private _cdr: ChangeDetectorRef, private spinner: NgxSpinnerService, private _http: HttpClient, private _auth: AuthService) {

  }

  ngOnInit(): void {
    moment.locale('it');

    this._cantieriService.getCantiereFullSpecification(this.cantieriId[0])
      .subscribe(
        (res) => {
          this.cantiere = res;
        },
        (err) => {
          LoggingService.log('ERRORE get cantiere', LogLevel.error, err);
        },
        async () => {
        },
      )
  }

  ngOnChanges(): void {
    this.loadChartData();
    this.allReports = [];

  }

  downloadReport(reportId: string, referenceDate: string) {
    if (this.cantiere) {
      this.spinner.show(undefined,
        {
          type: 'ball-fall',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)', // colore sfondo
          color: '#1898d6', // colore icona che si muove
          fullScreen: true
        });
      this.pdfExport.reportSomma(+reportId, referenceDate, referenceDate, 'pdf', this.cantiere, true, true, true, true, true)
    }
  }

  loadChartData() {
    this.cantieriId.forEach(element => {
      this._cantieriService.getReportDiCantiere(element, null, this.dateFrom, this.dateTo).subscribe(
        (res: reportShortModel[]) => {
          console.warn('Lista di report per questo cantiere scaricata', res);
          this.allReports.push(...res);
          this.processData();
        },
        (err) => {
          console.error('Errore get lista report per questo cantiere', err);
        }
      );
    });
  }

  private processData() {
    // Reset arrays
    this.costi = [];
    this.ricavi = [];
    this.margine = [];
    this.referenceDate = [];
    this.ids = []; // Array per tenere traccia degli ID dei report per ogni data
    this.totaliValori = {costi: 0, ricavi: 0, margine: 0};

    // Oggetto per memorizzare le somme e gli ID
    const sums = {};

    // Converti le date e ordina i report
    this.allReports.sort((a, b) => moment(a.referenceDate, 'DD-MM-YYYY').diff(moment(b.referenceDate, 'DD-MM-YYYY')));

    // Somma i valori per le date uguali e accumula gli ID
    this.allReports.forEach(element => {
      const date = moment(element.referenceDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      if (!sums[date]) {
        sums[date] = {costi: 0, ricavi: 0, margine: 0, ids: []};
      }
      sums[date].costi += element.costi;
      sums[date].ricavi += element.ricavi;
      sums[date].margine += element.margine;
      sums[date].ids.push(element.id); // Accumula gli ID per ogni data
      this.totaliValori.costi += element.costi;
      this.totaliValori.ricavi += element.ricavi;
      this.totaliValori.margine += element.margine;
    });

    // Converti l'oggetto di somme in array per il grafico
    Object.keys(sums).forEach(date => {
      this.referenceDate.push(date);
      this.costi.push(sums[date].costi);
      this.ricavi.push(sums[date].ricavi);
      this.margine.push(sums[date].margine);
      this.ids.push(sums[date].ids); // Inserisci l'array di ID
    });

    this.totali.emit(this.totaliValori);
    this.updateChart();
    this._cdr.detectChanges();
  }

  updateChart() {
    this.lineChartOptions = {
      series: [
        {
          name: 'Costi',
          type: 'line',
          color: '#F55252',
          data: this.costi.map((val, index) => {
            return {
              x: this.referenceDate[index],
              y: val
            };
          })
        },
        {
          name: 'Ricavi',
          type: 'line',
          color: '#40C057',
          data: this.ricavi.map((val, index) => {
            return {
              x: this.referenceDate[index],
              y: val
            };
          })
        },
        {
          name: 'Margine Positivo',
          type: 'rangeArea',
          color: '#40C057', // Verde per margine positivo
          data: this.referenceDate.map((date, index) => {
            return this.ricavi[index] >= this.costi[index] ? {
              x: date,
              y: [this.costi[index], this.ricavi[index]]
            } : {
              x: date,
              y: [this.costi[index], this.costi[index]] // Nessun valore se il margine è negativo, per questo lo faccio valore un  punto così non è visibile
            };
          })
        },
        {
          name: 'Margine Negativo',
          type: 'rangeArea',
          color: '#F55252', // Rosso per margine negativo, per questo lo faccio valore un  punto così non è visibile
          data: this.referenceDate.map((date, index) => {
            return this.ricavi[index] < this.costi[index] ? {
              x: date,
              y: [this.costi[index], this.ricavi[index]]
            } : {
              x: date,
              y: [this.costi[index], this.costi[index]] // Nessun valore se il margine è positivo
            };
          })
        }
      ],
      chart: {
        height: this.height,
        type: 'rangeArea',
        animations: {
          speed: 500
        },
        defaultLocale: 'it',
        locales: [{
          name: 'it',
          options: {
            months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
            shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
            days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
            shortDays: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            toolbar: {
              download: 'Scarica SVG',
              selection: 'Selezione',
              selectionZoom: 'Zoom Selezione',
              zoomIn: 'Zoom Avanti',
              zoomOut: 'Zoom Indietro',
              pan: 'Sposta',
              reset: 'Reimposta Zoom',
            }
          }
        }],
        events: {
          click: (event, chartContext, {seriesIndex, dataPointIndex}) => {

            const reportIds = this.ids[dataPointIndex]; // Ottieni l'ID corrispondente al punto cliccato
            const r = new Set<number>(reportIds);
            const referenceDate = this.referenceDate[dataPointIndex]; // Ottieni la data di riferimento corrispondente al punto cliccato
            for (const el of r) {

              this.downloadReport(String(el), referenceDate);
            }

          }
        }
      },
      theme: {
        mode: 'light',  // Puoi scegliere tra 'light' e 'dark'
        palette: 'palette1',  // Questo è un esempio, scegli la palette che preferisci
        monochrome: {
          enabled: false,
          color: '#81C8F7',
          shadeTo: 'light',
          shadeIntensity: 0.65
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        width: [3, 3, 0] // Spessore delle linee per Costi, Ricavi e Margine
      },
      title: {
        text: 'Analisi Economica'
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          }
        },
      },
      xaxis: {
        type: 'datetime',
        categories: this.referenceDate
      },
      tooltip: {
        custom: function ({series, seriesIndex, dataPointIndex, w}) {
          const costi = series[0][dataPointIndex];
          const ricavi = series[1][dataPointIndex];
          const margine = ricavi - costi;

          // Calcolo delle percentuali
          const costoPercentuale = (costi / ricavi) * 100;
          const marginePercentuale = (margine / ricavi) * 100;

          // Formattazione dei numeri e delle percentuali
          const costiFormatted = costi.toLocaleString('it-IT', {maximumFractionDigits: 0});
          const ricaviFormatted = ricavi.toLocaleString('it-IT', {maximumFractionDigits: 0});
          const margineFormatted = margine.toLocaleString('it-IT', {maximumFractionDigits: 0});
          const costoPercentualeFormatted = costoPercentuale.toLocaleString('it-IT', {maximumFractionDigits: 2});
          const marginePercentualeFormatted = marginePercentuale.toLocaleString('it-IT', {maximumFractionDigits: 2});

          return '<div class="arrow_box">' +
            '<span class="danger">Costi: ' + costiFormatted + ' € | ' + costoPercentualeFormatted + ' %</span><br>' +
            '<span class="success">Ricavi: ' + ricaviFormatted + ' €</span><br>' +
            '<span class="info">Margine: ' + margineFormatted + ' € | ' + marginePercentualeFormatted + ' %</span>' +
            '</div>'
        }
      }
    };
    this._cdr.detectChanges();
  }
}
