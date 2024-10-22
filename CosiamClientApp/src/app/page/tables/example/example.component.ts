import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatatableData } from './data/datatables.data';
import {
  ColumnMode,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss', '../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExampleComponent implements OnInit {


  constructor(private http: HttpClient, private _router: Router) {
   
  }

  ngOnInit() {
   this._router.navigate(['/page/dashboards/main-dashboard']);
  }
}
