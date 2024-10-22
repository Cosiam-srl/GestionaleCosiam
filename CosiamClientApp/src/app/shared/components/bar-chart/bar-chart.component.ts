import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexStroke, ApexGrid, ApexTheme, ApexResponsive, ApexTooltip, ApexNonAxisChartSeries, ApexLegend, ApexPlotOptions } from 'ng-apexcharts';
import * as moment from 'moment';
import 'moment/locale/it';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'app/shared/auth/auth.service';

export interface ChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
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
  colors: string[];
  labels?: string[],
  legend?: ApexLegend,
  plotOptions?: ApexPlotOptions,
}

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() totGiorni: number;
  @Input() totProduzione: number;
  @Input() avanzamentoTemporale: number;
  @Input() percAvanzamentoTemporale: number;
  @Input() avanzamentoProduzione: number;
  @Input() percAvanzamentoProduzione: number;
  percScostamento: number;

  barChartOptions: Partial<ChartOptions> = null;

  constructor(private _cdr: ChangeDetectorRef, private spinner: NgxSpinnerService, private _http: HttpClient, private _auth: AuthService) { }

  ngOnInit(): void {
    moment.locale('it');
    this.updateChart();
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  updateChart() {
    const overflowAvanzamentoProduzione = this.percAvanzamentoProduzione > 100 ? this.percAvanzamentoProduzione - 100 : 0;
    const overflowAvanzamentoTemporale = this.percAvanzamentoTemporale > 100 ? this.percAvanzamentoTemporale - 100 : 0;
    this.percScostamento = this.percAvanzamentoProduzione - this.percAvanzamentoTemporale;
    const percScostamentoPositivo = this.percScostamento > 0 ? this.percScostamento : 0;
    const percScostamentoNegativo = this.percScostamento < 0 ? this.percScostamento : 0;
    this.percAvanzamentoProduzione = this.percAvanzamentoProduzione < 100 ? this.percAvanzamentoProduzione : 100;
    this.percAvanzamentoTemporale = this.percAvanzamentoTemporale < 100 ? this.percAvanzamentoTemporale : 100;
    const totGiorni = this.totGiorni;
    const totProduzione = this.formatNumber(this.totProduzione);
    const avanzamentoTemporale = this.avanzamentoTemporale;
    const avanzamentoProduzione = this.formatNumber(this.avanzamentoProduzione);

    this.barChartOptions = {
      chart: {
        height: 150,
        type: 'bar',
        stacked: true,
      },
      colors: ["#F55252", "#40C057", "#ACE0FC"],
      plotOptions: {
        bar: {
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      series: [
        {
          name: "Avanz.",
          data: [this.percAvanzamentoTemporale, this.percAvanzamentoProduzione, 0],
          color: "#40C057"
        },
        {
          name: "Overflow",
          data: [overflowAvanzamentoTemporale, overflowAvanzamentoProduzione, 0],
          color: "#F55252"
        },
        {
          name: "Scostamento Negativo",
          data: [0, 0, percScostamentoNegativo],
          color: "#F55252"
        },
        {
          name: "Scostamento Positivo",
          data: [0, 0, percScostamentoPositivo],
          color: "#40C057"
        },
      ],
      xaxis: {
        categories: ["Temp.", "Prod.", "Scost."],
        tickAmount: 5
      },
      tooltip: {
        y: {
          formatter: function (val, { series, seriesIndex, dataPointIndex, w }) {
            let additionalInfo = '';
            if (dataPointIndex === 0) {
              additionalInfo = `${avanzamentoTemporale}/${totGiorni}`;
            } else if (dataPointIndex === 1) {
              additionalInfo = `${avanzamentoProduzione}/${totProduzione}`;
            }
            return `${additionalInfo} | ${val} %`;
          },
          title: {
            formatter: (seriesName) => seriesName
          }
        }
      },
      legend: {
        show: false,
      }
    };
    this._cdr.detectChanges();

  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    } else {
      return num.toString();
    }
  }
}
