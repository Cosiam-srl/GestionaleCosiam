import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ig-dashboard',
  templateUrl: './ig-dashboard.component.html',
  styleUrls: ['./ig-dashboard.component.scss']
})
export class IgDashboardComponent implements OnInit {

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
  }

}
