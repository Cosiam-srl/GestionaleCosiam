import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class HeadOfOrderGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAuth = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();
    const isHeadOfOrder = this.authService.isHeadOfOrder();
    if (!isAuth || (!isHeadOfOrder && !isAdmin)) {
      this.router.navigate(['/pages/error']);
    } else {
      return true;
    }
  }
}
