import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAuth = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    if (!isAuth || !isAdmin) {
      this.router.navigate(['/pages/error']);
    } else {
      return true;
    }
  }
}
