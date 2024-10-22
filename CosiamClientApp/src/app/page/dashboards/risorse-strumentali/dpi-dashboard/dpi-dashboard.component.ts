import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dpi-dashboard',
  templateUrl: './dpi-dashboard.component.html',
  styleUrls: ['./dpi-dashboard.component.scss']
})
export class DpiDashboardComponent implements OnInit {

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
