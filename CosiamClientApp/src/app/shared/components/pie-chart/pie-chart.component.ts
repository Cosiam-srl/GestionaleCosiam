import {ChangeDetectorRef, Component, Input, OnChanges, OnInit} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexStroke,
  ApexTheme,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import * as moment from 'moment';
import 'moment/locale/it';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient} from '@angular/common/http';
import {AuthService} from 'app/shared/auth/auth.service';

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
}

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, OnChanges {
  @Input() valore1: number;
  @Input() valore2: number;
  @Input() valore3: number;

  pieChartOptions: Partial<ChartOptions> = null;

  constructor(private _cdr: ChangeDetectorRef, private spinner: NgxSpinnerService, private _http: HttpClient, private _auth: AuthService) {
  }

  ngOnInit(): void {
    moment.locale('it');
    this.updateChart();
  }

  ngOnChanges(): void {
    this.updateChart();
  }

  updateChart() {
    this.pieChartOptions = {
      chart: {
        type: 'pie',
        height: 320
      },
      colors: ['#176dc8', '#8e8e8e', '#ef4e4e'],
      labels: ['Personale', 'Mezzi', 'Materiale'],
      series: [this.valore1, this.valore2, this.valore3],
      legend: {
        itemMargin: {
          horizontal: 2
        },
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`
        }
      },
      responsive: [{
        breakpoint: 576,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };
    this._cdr.detectChanges();
  }
}
