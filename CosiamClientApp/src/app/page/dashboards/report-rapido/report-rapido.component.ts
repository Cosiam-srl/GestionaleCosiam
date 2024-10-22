import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-report-rapido',
  templateUrl: './report-rapido.component.html',
  styleUrls: ['./report-rapido.component.scss']
})
export class ReportRapidoComponent implements OnInit {

   //popolato quando dalla tabella cantieri viene selezionato un cantiere
   cantiereSelected = null;
   @ViewChild('test') test: any;
 

  constructor() { }

  ngOnInit(): void {
  }

}
