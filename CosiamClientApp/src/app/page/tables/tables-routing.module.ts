import { SuppliersComponent } from './suppliers/suppliers.component';
import { CustomersComponent } from './customers/customers.component';
import { ExampleComponent } from './example/example.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeesComponent } from './employees/employees.component';
import { CantieriComponent } from './cantieri/cantieri.component';
import { ServizifornitoreComponent } from './servizifornitore/servizifornitore.component';
import { RisorseStrumentaliComponent } from './risorse-strumentali-table/risorse-strumentali/risorse-strumentali.component';
import { ContrattiComponent } from './contratti/contratti.component';
import { PrezziarioComponent } from './servizi cliente/prezziario.component';
import { PrezziariGeneraliComponent } from './prezziari-generali/prezziari-generali.component';
import { HeadOfOrderGuard } from 'app/shared/auth/headOfOrder-guard.service';
import { ForemanGuard } from 'app/shared/auth/foreman-guard.service';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { MagazzinoComponent } from './magazzino/magazzino.component';

const routes: Routes = [
  //il path '' redirige tramite l'example component verso la main dashboard
  {
    path: '',
    component: ExampleComponent
  },
  {
    path: 'personale',
    component: EmployeesComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'fornitori',
    component: SuppliersComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'clienti',
    component: CustomersComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'cantieri',
    component: CantieriComponent,
    canActivate: [AuthGuard, ForemanGuard]
  },
  {
    path: 'prezziario/:id',
    component: PrezziarioComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'prezziari-generali',
    component: PrezziariGeneraliComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'servizifornitori',
    component: ServizifornitoreComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'risorsestrumentali',
    component: RisorseStrumentaliComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'magazzino',
    component: MagazzinoComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  },
  {
    path: 'contratti',
    component: ContrattiComponent,
    canActivate: [AuthGuard, HeadOfOrderGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TablesRoutingModule { }
