import { CanteriDashboardComponent } from './cantieri-dashboard/canteri-dashboard.component';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import { DashboardsRoutingModule } from './dashboards-routing.module';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditUserDashboardComponent } from './user/edit-user-dashboard/edit-user-dashboard.component';
import { ViewUserComponentComponent } from './user/view-user-component/view-user-component.component';
import { PersonaleDashboardComponent } from './personale-dashboard/personale-dashboard/personale-dashboard.component';
import { MezziDashboardComponent } from './risorse-strumentali/mezzi-dashboard/mezzi-dashboard.component';
import { DpiDashboardComponent } from './risorse-strumentali/dpi-dashboard/dpi-dashboard.component';
import { SdmDashboardComponent } from './risorse-strumentali/sdm-dashboard/sdm-dashboard.component';
import { IgDashboardComponent } from './risorse-strumentali/ig-dashboard/ig-dashboard.component';
import { AttrezzatureDashboardComponent } from './risorse-strumentali/attrezzature-dashboard/attrezzature-dashboard.component';
import { FornitoriDashboardComponent } from './fornitori-dashboard/fornitori-dashboard.component';
import { ClientiDashboardComponent } from './clienti-dashboard/clienti-dashboard.component';
import { ContrattiDashboardComponent } from './contratti-dashboard/contratti-dashboard.component';
import { TablesModule } from '../tables/tables.module';
import { ReportRapidoComponent } from './report-rapido/report-rapido.component';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';

@NgModule({
  declarations: [
    MainDashboardComponent,
    CanteriDashboardComponent,
    UserDashboardComponent,
    EditUserDashboardComponent,
    ViewUserComponentComponent,
    PersonaleDashboardComponent,
    MezziDashboardComponent,
    AttrezzatureDashboardComponent,
    DpiDashboardComponent,
    SdmDashboardComponent,
    IgDashboardComponent,
    FornitoriDashboardComponent,
    ClientiDashboardComponent,
    ContrattiDashboardComponent,
    ReportRapidoComponent],
    imports: [
        CommonModule,
        DashboardsRoutingModule,
        RouterModule,
        ChartistModule,  // aggiunto modulo per i grafici
        NgApexchartsModule,  // aggiunto modulo per i grafici + figo
        NgbCarouselModule,
        NgbModule,
        SharedModule,
        NgxDatatableModule,
        TablesModule,
        SpinnerComponent

    ],
  providers: [],
  exports: [CanteriDashboardComponent, UserDashboardComponent]
  // bootstrap: [CanteriDashboardComponent]
})
export class DashboardsModule { }
