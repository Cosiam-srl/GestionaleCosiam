import { NgModule } from '@angular/core';
import {CommonModule, DatePipe, NgOptimizedImage} from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { AutocompleteModule } from './components/autocomplete/autocomplete.module';
import { PipeModule } from 'app/shared/pipes/pipe.module';

// COMPONENTS
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HorizontalMenuComponent } from './horizontal-menu/horizontal-menu.component';
import { VerticalMenuComponent } from './vertical-menu/vertical-menu.component';
import { CustomizerComponent } from './customizer/customizer.component';
import { NotificationSidebarComponent } from './notification-sidebar/notification-sidebar.component';

// DIRECTIVES
import { ToggleFullscreenDirective } from './directives/toggle-fullscreen.directive';
import { SidebarLinkDirective } from './directives/sidebar-link.directive';
import { SidebarDropdownDirective } from './directives/sidebar-dropdown.directive';
import { SidebarAnchorToggleDirective } from './directives/sidebar-anchor-toggle.directive';
import { SidebarDirective } from './directives/sidebar.directive';
import { TopMenuDirective } from './directives/topmenu.directive';
import { TopMenuLinkDirective } from './directives/topmenu-link.directive';
import { TopMenuDropdownDirective } from './directives/topmenu-dropdown.directive';
import { TopMenuAnchorToggleDirective } from './directives/topmenu-anchor-toggle.directive';

import { HttpClient } from '@angular/common/http';
import { ImageGalleryComponent } from './components/gallery/image-gallery/image-gallery.component';
import { DatepickerComponent } from './components/datepicker/datepicker/datepicker.component';
import { EmployeesCantieriComponent } from './components/employees-cantieri/employees-cantieri.component';
import { MezziCantieriComponent } from './components/mezzi-cantieri/mezzi-cantieri.component';
import { TaskboardComponent } from './components/taskboard/taskboard.component';
import { CrudModalComponent } from './components/taskboard/crud-modal/crud-modal.component';
import { FilesCantieriComponent } from './components/files-cantieri/files-cantieri.component';
import { SuppliersCantieriComponent } from './components/suppliers-cantieri/suppliers-cantieri.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NoteDiCantiereComponent } from './components/note-di-cantiere/note-di-cantiere.component';
import { WeatherComponent } from './components/weather/weather.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ComposizioneCostiComponent } from './components/composizione-costi/composizione-costi.component';
import { DettaglioSalFattureComponent } from './components/dettaglio-sal-fatture/dettaglio-sal-fatture.component';
import { UploaderComponent } from './components/uploader/uploader.component';
import { DatepickerSingleComponent } from './components/datepicker-single/datepicker-single.component';
import { ReportComponent } from './components/report/report.component';
import { BeniEServiziComponent } from './components/beni-e-servizi/beni-e-servizi.component';
import { MapsComponent } from './components/maps/maps.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MezziGenericTableComponent } from './components/mezzi-generic-table/mezzi-generic-table.component';
import { FornitoriGenericTableScadenzeComponent } from './components/fornitori-generic-table-scadenze/fornitori-generic-table-scadenze.component';
import { ReportHSEComponent } from './components/report-hse/report-hse.component';
import { BudgetCantiereComponent } from './components/budget-cantiere/budget-cantiere.component';
import { EditableGridMiniComponent } from './components/editable-grid-mini/editable-grid-mini.component';
import { EmployeesSmallFormComponent } from './components/employees-small-form/employees-small-form.component';
import { MezziSmallFormComponent } from './components/mezzi-small-form/mezzi-small-form.component';
import { FornitoriSmallFormComponent } from './components/fornitori-small-form/fornitori-small-form.component';

import { StepsModule } from 'primeng/steps';
import { BeniEServiziSmallFormComponent } from './components/beni-e-servizi-small-form/beni-e-servizi-small-form.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { PrezzarioSmallFormComponent } from 'app/page/tables/servizi cliente/prezzario-small-form/prezzario-small-form.component';



@NgModule({
    exports: [
        CommonModule,
        FooterComponent,
        NavbarComponent,
        VerticalMenuComponent,
        HorizontalMenuComponent,
        CustomizerComponent,
        NotificationSidebarComponent,
        ToggleFullscreenDirective,
        SidebarDirective,
        TopMenuDirective,
        NgbModule,
        TranslateModule,
        ImageGalleryComponent,
        DatepickerComponent,
        FormsModule,
        EmployeesCantieriComponent,
        MezziCantieriComponent,
        TaskboardComponent,
        FilesCantieriComponent,
        SuppliersCantieriComponent,
        NoteDiCantiereComponent,
        WeatherComponent,
        NgSelectModule,
        AutocompleteModule,
        FormsModule,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent,
        ComposizioneCostiComponent,
        DettaglioSalFattureComponent,
        UploaderComponent,
        DatepickerSingleComponent,
        PipeModule,
        ReportComponent,
        BeniEServiziComponent,
        MapsComponent,
        SignaturePadComponent,
        GenericTableComponent,
        NgxSpinnerModule,
        MezziGenericTableComponent,
        FornitoriGenericTableScadenzeComponent,
        ReportHSEComponent,
        BudgetCantiereComponent,
        EditableGridMiniComponent
    ],
    imports: [
        RouterModule,
        CommonModule,
        NgbModule,
        TranslateModule,
        FormsModule,
        OverlayModule,
        ReactiveFormsModule,
        AutocompleteModule,
        PipeModule,
        NgxDatatableModule,
        NgSelectModule,
        NgApexchartsModule,
        NgxSpinnerModule,
        StepsModule,
        PrezzarioSmallFormComponent,
        NgOptimizedImage
    ],
    providers: [
        HttpClient,
        {
            provide: NgbDateAdapter,
            useClass: NgbDateNativeAdapter
        },
        NgbInputDatepicker,
        DatePipe

    ],
    declarations: [
        FooterComponent,
        NavbarComponent,
        VerticalMenuComponent,
        HorizontalMenuComponent,
        CustomizerComponent,
        NotificationSidebarComponent,
        ToggleFullscreenDirective,
        SidebarLinkDirective,
        SidebarDropdownDirective,
        SidebarAnchorToggleDirective,
        SidebarDirective,
        TopMenuLinkDirective,
        TopMenuDropdownDirective,
        TopMenuAnchorToggleDirective,
        TopMenuDirective,
        ImageGalleryComponent,
        DatepickerComponent,
        EmployeesCantieriComponent,
        MezziCantieriComponent,
        TaskboardComponent,
        CrudModalComponent,
        FilesCantieriComponent,
        SuppliersCantieriComponent,
        NoteDiCantiereComponent,
        WeatherComponent,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent,
        ComposizioneCostiComponent,
        DettaglioSalFattureComponent,
        UploaderComponent,
        DatepickerSingleComponent,
        ReportComponent,
        BeniEServiziComponent,
        MapsComponent,
        SignaturePadComponent,
        GenericTableComponent,
        MezziGenericTableComponent,
        FornitoriGenericTableScadenzeComponent,
        ReportHSEComponent,
        BudgetCantiereComponent,
        EditableGridMiniComponent,
        EmployeesSmallFormComponent,
        MezziSmallFormComponent,
        FornitoriSmallFormComponent,
        ReportComponent,
        BeniEServiziSmallFormComponent
    ]
})
export class SharedModule { }
