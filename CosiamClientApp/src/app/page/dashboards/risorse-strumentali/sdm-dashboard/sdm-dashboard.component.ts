import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sdm-dashboard',
  templateUrl: './sdm-dashboard.component.html',
  styleUrls: ['./sdm-dashboard.component.scss']
})
export class SdmDashboardComponent implements OnInit {

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
