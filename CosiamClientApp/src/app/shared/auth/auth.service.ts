import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { interval, Observable } from 'rxjs';
import { AppConfigService } from '../services/configs/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = AppConfigService.settings.apiServer.baseUrl + '/api/authenticate';
  private _http: HttpClient;
  private _router: Router;
  private _jwtHelper: JwtHelperService;
  private readonly schedule = interval(10000);

  constructor(http: HttpClient, router: Router) {
    this._http = http;
    this._jwtHelper = new JwtHelperService();
    this._router = router;

    this.schedule.subscribe(() => { this.checkSession(); });
  }

  checkSession() {
    // console.debug('verifico sessione...');
    const token = this.whoAmI();
    if (token) {
      const diff = this.whoAmI().exp.valueOf() - new Date(Date.now()).valueOf();
      // console.debug(new Date(diff).getUTCHours() + ':' + new Date(diff).getUTCMinutes() + ':' + new Date(diff).getUTCSeconds() +
      //   ' ore rimanenti allo scadere della sessione');

      if (!this.isAuthenticated()) {
        this._router.navigate(['/']);
        this.logout();
      }
    }
    return;
  }

  retrieveToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    return token;
  }

  retrieveHeaders(): HttpHeaders {
    const token = this.retrieveToken();

    let authHeader = null;
    if (token) {
      authHeader = new HttpHeaders()
        .append('Authorization', 'Bearer ' + token);
    }
    return authHeader;
  }

  register(user: RegistrationModel) {
    return this._http.post(
      this.url + '/Register',
      user,
      { headers: this.retrieveHeaders(), observe: 'response' }
    );
  }

  login(credentials): Observable<HttpResponse<AuthResponse>> {
    return this._http.post(
      this.url + '/Login',
      credentials,
      { observe: 'response' }
    ) as  Observable<HttpResponse<AuthResponse>>;
  }

  forgotPassword(username: { username: string }) {
    return this._http.post(
      this.url + '/forgot-password',
      username,
      { observe: 'response' }
    );
  }
  resetPassword(form) {
    return this._http.post(
      this.url + '/reset-password',
      form,
      { observe: 'response'}
    );
  }

  validatePassword(passwd: string): boolean {
    if (passwd.length < 8) {
      return false;
    }
    return true;
  }

  isAuthenticated(): boolean {
    const token = this.whoAmI();
    if (token && token.exp > new Date(Date.now())) {
      return true;
    } else {
      return false;
    }
  }

  whoAmI() {
    const token = this.retrieveToken();
    if (!token) {
      return null;
    }

    const identity = this._jwtHelper.decodeToken(token);
    const i = new TokenStructure();
    i.username = identity.username;
    i.roles = identity.roles;
    const dateAsNumber = Number.parseInt(identity.exp, 10);
    i.exp = new Date(dateAsNumber * 1000);
    localStorage.setItem('tokenExpiration', i.exp.toISOString());
    return i;
  }

  isForeman(): boolean {
    const isAuth = this.isAuthenticated();
    if(isAuth) return true;

    const roles = this.whoAmI().roles;
    if (!roles) {
      return false;
    }
    const foreman = roles.indexOf('Foreman');
    // console.log(admin);
    if (foreman >= 0) {
      return true;
    }

    return false;
  }

  isHeadOfOrder(): boolean {
    const roles = this.whoAmI().roles;
    if (!roles) {
      return false;
    }
    const foreman = roles.indexOf('HeadOfOrder');
    // console.log(admin);
    if (foreman >= 0) {
      return true;
    }

    return false;
  }

  isAdmin(): boolean {
    const roles = this.whoAmI().roles;
    if (!roles) {
      return false;
    }
    
    const admin = roles.indexOf('Admin');
    // console.log(admin);
    if (admin >= 0) {
      return true;
    }

    return false;
  }

  // TODO: Aggiungere funzione di verifica negli altri ruoli, guardando isAdmin

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
  }
}

export class AuthResponse {
  token: string;
  expiration: Date;
}

export class TokenStructure {
  username: string;
  roles: string;
  exp: Date;
}

export class RegistrationModel {
  username: string;
  email: string;
  password: string;
}
