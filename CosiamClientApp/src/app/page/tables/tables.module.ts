import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TablesRoutingModule } from './tables-routing.module';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ExampleComponent } from './example/example.component';
import { EmployeesComponent } from './employees/employees.component';

import { CustomersComponent } from './customers/customers.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { CantieriComponent } from './cantieri/cantieri.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { ServizifornitoreComponent } from './servizifornitore/servizifornitore.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehiclesComponent } from './risorse-strumentali-table/vehicles/vehicles.component';
import { RisorseStrumentaliComponent } from './risorse-strumentali-table/risorse-strumentali/risorse-strumentali.component';
import { AttrezzaturaTableComponent } from './risorse-strumentali-table/attrezzatura-table/attrezzatura-table.component';
import { DpiTableComponent } from './risorse-strumentali-table/dpi-table/dpi-table.component';
import { StrumentiDiMisuraTableComponent } from './risorse-strumentali-table/strumenti-di-misura-table/strumenti-di-misura-table.component';
import { InventarioGeneraleTableComponent } from './risorse-strumentali-table/inventario-generale-table/inventario-generale-table.component';
import { ContrattiComponent } from './contratti/contratti.component';
import { PrezziarioComponent } from './servizi cliente/prezziario.component';
import { PrezziariGeneraliComponent } from './prezziari-generali/prezziari-generali.component';
import {SpinnerComponent} from '../../shared/spinner/spinner.component';



@NgModule({
  declarations: [
    ExampleComponent,
    EmployeesComponent,
    VehiclesComponent,
    CustomersComponent,
    SuppliersComponent,
    CantieriComponent,
    ServizifornitoreComponent,
    RisorseStrumentaliComponent,
    AttrezzaturaTableComponent,
    DpiTableComponent,
    StrumentiDiMisuraTableComponent,
    InventarioGeneraleTableComponent,
    ContrattiComponent,
    PrezziarioComponent,
    PrezziariGeneraliComponent
  ],
  imports: [
    CommonModule,
    TablesRoutingModule,
    RouterModule,
    NgxDatatableModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent
  ],
  exports: [
    CantieriComponent
  ]
})
export class TablesModule { }
