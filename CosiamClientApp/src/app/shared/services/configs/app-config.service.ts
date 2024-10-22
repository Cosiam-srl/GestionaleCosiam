import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

export interface IAppConfig {
  env: {
      name: string;
  };
  logging: {
      console: boolean;
      minLevel: string;
  };
  apiServer: {
      baseUrl: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  static settings: IAppConfig;
  constructor(private http: HttpClient) {}
  load() {
      // Path to json configuration file:
      const jsonFile = `assets/configs/config.${environment.name}.json`;

      // Retrieve from server the configuration file and loading it into an IAppConfig object:
      return new Promise<void>((resolve, reject) => {
          this.http.get(jsonFile).toPromise().then((response: IAppConfig) => {
             AppConfigService.settings = <IAppConfig>response;
             resolve();
          }).catch((response: any) => {
             reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
          });
      });
  }
}
