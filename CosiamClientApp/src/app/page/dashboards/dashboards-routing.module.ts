import { CanteriDashboardComponent } from './cantieri-dashboard/canteri-dashboard.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { EditUserDashboardComponent } from './user/edit-user-dashboard/edit-user-dashboard.component';
import { ViewUserComponentComponent } from './user/view-user-component/view-user-component.component';
import { PersonaleDashboardComponent } from './personale-dashboard/personale-dashboard/personale-dashboard.component';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { AdminGuard } from 'app/shared/auth/admin-guard.service';
import { MezziDashboardComponent } from './risorse-strumentali/mezzi-dashboard/mezzi-dashboard.component';
import { AttrezzatureDashboardComponent } from './risorse-strumentali/attrezzature-dashboard/attrezzature-dashboard.component';
import { DpiDashboardComponent } from './risorse-strumentali/dpi-dashboard/dpi-dashboard.component';
import { SdmDashboardComponent } from './risorse-strumentali/sdm-dashboard/sdm-dashboard.component';
import { IgDashboardComponent } from './risorse-strumentali/ig-dashboard/ig-dashboard.component';
import { ClientiDashboardComponent } from './clienti-dashboard/clienti-dashboard.component';
import { FornitoriDashboardComponent } from './fornitori-dashboard/fornitori-dashboard.component';
import { ContrattiDashboardComponent } from './contratti-dashboard/contratti-dashboard.component';
import { ReportRapidoComponent } from './report-rapido/report-rapido.component';
import { ExampleComponent } from '../tables/example/example.component';
import { HeadOfOrderGuard } from 'app/shared/auth/headOfOrder-guard.service';
import { ForemanGuard } from 'app/shared/auth/foreman-guard.service';

const routes: Routes = [

  {
    path: '',
    component: ExampleComponent
  },
  {
    path: 'main-dashboard',
    component: MainDashboardComponent
  },
  {
    // Definisco un parametro nella dashboard dei cantieri dove specifico
    // l'id del cantiere di cui disegnare la dashboard
    path: 'cantieri/:id',
    component: CanteriDashboardComponent,
    canActivate: [AuthGuard, ForemanGuard]
  },
  {
    path: 'utenti',
    component: UserDashboardComponent
  },
  {
    path: 'utente/:id',
    component: ViewUserComponentComponent
  },
  {
    path: 'modifica/utente/:id',
    component: EditUserDashboardComponent
  },
  {
    path: 'personale/:id',
    component: PersonaleDashboardComponent
  },
  {
    path: 'mezzi/:id',
    component: MezziDashboardComponent
  },
  {
    path: 'attrezzature/:id',
    component: AttrezzatureDashboardComponent
  },
  {
    path: 'dpi/:id',
    component: DpiDashboardComponent
  },
  {
    path: 'sdm/:id',
    component: SdmDashboardComponent
  },
  {
    path: 'ig/:id',
    component: IgDashboardComponent
  },
  {
    path: 'clienti/:id',
    component: ClientiDashboardComponent
  },
  {
    path: 'fornitori/:id',
    component: FornitoriDashboardComponent
  },
  {
    path: 'contratti/:id',
    component: ContrattiDashboardComponent
  },
  {
    path: 'report',
    component: ReportRapidoComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
