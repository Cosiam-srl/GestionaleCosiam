import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attrezzature-dashboard',
  templateUrl: './attrezzature-dashboard.component.html',
  styleUrls: ['./attrezzature-dashboard.component.scss']
})
export class AttrezzatureDashboardComponent implements OnInit {
 // attributo per le tabs
 active = 1;

  constructor() { }

  ngOnInit(): void {
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
