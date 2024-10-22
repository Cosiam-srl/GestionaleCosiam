import { RouteInfo } from './vertical-menu.metadata';

// Sidebar menu Routes and data
export const HEADOFORDERROUTES: RouteInfo[] = [

  // {
  //   path: '/page', title: 'Page', icon: 'ft-home', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
  // },
  // {

  //   path: '/page/dashboards', title: 'Dashboards', icon: 'ft-bar-chart', class: 'has-sub', badge: '', badgeClass: '', isExternalLink: false,
  //   submenu: [
  //     { path: '/page/dashboards/main-dashboard', title: 'Dashboard1', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
  //     { path: '/page/dashboards/cantieri', title: 'Dashboard2', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] }
  //   ]
  // },
  {
    path: '/page/dashboards/main-dashboard', title: 'Dashboard', icon: 'ft-bar-chart', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
  },
  {
    path: '/page/dashboards/report', title: 'Report', icon: 'ft-edit', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] 
  },
  {
    path: '/page/tables', title: 'Tabelle', icon: 'ft-grid ft-align-left', class: 'has-sub', badge: '', badgeClass: '', isExternalLink: false,
    submenu: [
      { path: '/page/tables/clienti', title: 'Clienti', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      { path: '/page/tables/contratti', title: 'Contratti', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      { path: '/page/tables/prezziari-generali', title: 'Prezzari', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      { path: '/page/tables/cantieri', title: ' Cantieri', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []},
      { path: '/page/tables/personale', title: 'Personale', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      { path: '/page/tables/risorsestrumentali', title: 'Risorse strumentali', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      { path: '/page/tables/fornitori', title: 'Fornitori', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
      // { path: '/page/tables/servizifornitori', title: 'Servizi Fornitori', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
    ]
  },
  {
    path: 'https://e38.atlassian.net/servicedesk/customer/portal/7', title: 'Centro Assistenza', icon: 'ft-help-circle', class: '', badge: '', badgeClass: '', isExternalLink: true, submenu: [] 
  },
  // SEZIONE UTENTI NASCOSTA ATTUALMENTE
  // {
  //   path: '/page/dashboards/utenti' , title: 'Utenti', icon: 'ft-user', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: []
  // }


//   {
//     path: '', title: 'Menu Levels', icon: 'ft-align-left', class: 'has-sub', badge: '3', badgeClass: 'badge badge-pill badge-danger float-right mr-1 mt-1', isExternalLink: false,
//     submenu: [
//         { path: '/YOUR-ROUTE-PATH', title: 'Second Level', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
//         {
//             path: '', title: 'Second Level Child', icon: 'ft-arrow-right submenu-icon', class: 'has-sub', badge: '', badgeClass: '', isExternalLink: false,
//             submenu: [
//                 { path: '/YOUR-ROUTE-PATH', title: 'Third Level 1.1', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
//                 { path: '/YOUR-ROUTE-PATH', title: 'Third Level 1.2', icon: 'ft-arrow-right submenu-icon', class: '', badge: '', badgeClass: '', isExternalLink: false, submenu: [] },
//             ]
//         },
//     ]
// },
];
