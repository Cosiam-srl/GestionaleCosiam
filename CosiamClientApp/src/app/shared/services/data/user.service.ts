import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'app/models/user.model';
import { AuthService } from 'app/shared/auth/auth.service';
import { Observable } from 'rxjs';
import { AppConfigService } from '../configs/app-config.service';
import { DataService } from './data.service';

@Injectable({
    providedIn: 'root'
})
export class UserService extends DataService {
    users: User[];
    constructor(private http: HttpClient, private _authService: AuthService) {
        super(http);
        this._url = AppConfigService.settings.apiServer.baseUrl + '/api/Authenticate';
    }
    getAllUsers(): Observable<Object[]> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url + '/retrieve-users', { headers: authHeader }) as Observable<Object[]>
    }
    postNewUser(user: User): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.post(this._url + '/register', user, { headers: authHeader }) as Observable<Object>
    }
    setRoleUser(username: string, role: string): Observable<Object> {
        const authHeader = this._authService.retrieveHeaders();
        return this.http.get(this._url + '/assign-role/' + username + '/' + role, { headers: authHeader }) as Observable<Object>
    }
}
