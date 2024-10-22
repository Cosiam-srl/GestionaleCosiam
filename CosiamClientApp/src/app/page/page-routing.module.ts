import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from './page.component';


const routes: Routes = [
  // {
  //   path: '',
  //   component: PageComponent,
  //   data: {
  //     title: 'Page'
  //   }
  //   // children: [
  //   //   {
  //   //     path: 'page',
  //   //     component: PageComponent,
  //   //     data: {
  //   //       title: 'Page'
  //   //     }
  //   //   }
  //   // ]
  // },
  {
    path: 'dashboards',
    loadChildren: () => import('./dashboards/dashboards.module').then(m => m.DashboardsModule)
  },
  {
    path: 'tables',
    loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule { }
