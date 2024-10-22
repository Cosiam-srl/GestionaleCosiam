import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';


import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { ContentLayoutComponent } from './layouts/content/content-layout.component';
import { FullLayoutComponent } from './layouts/full/full-layout.component';

import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { AppConfigService } from './shared/services/configs/app-config.service';
import { LoggingService } from './shared/services/logging/logging.service';
import { DataService } from './shared/services/data/data.service';
import { CantieriService } from './shared/services/data/cantieri.service';
import { AdminGuard } from './shared/auth/admin-guard.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HeadOfOrderGuard } from './shared/auth/headOfOrder-guard.service';
import { ForemanGuard } from './shared/auth/foreman-guard.service';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt)


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initializeApp(appConfig: AppConfigService) {
  return () => {
    appConfig.load()
    .then(() =>
      LoggingService.setup()
    )
  }
}

@NgModule({
  declarations: [AppComponent, FullLayoutComponent, ContentLayoutComponent],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    AuthService,
    AuthGuard,
    HeadOfOrderGuard,
    ForemanGuard,
    AdminGuard,
    WINDOW_PROVIDERS,
    AppConfigService,                                             // Service to load configuration file;
    {
      provide: APP_INITIALIZER,                                   // Loading configurations on app initialization;
      useFactory: initializeApp,
      deps: [AppConfigService], multi: true
    },
    LoggingService,                                               // Service to control console logging with configs;
    DataService,
    CantieriService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
