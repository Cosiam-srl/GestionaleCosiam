import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable()
export class ForemanGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAdmin = this.authService.isAdmin();
    const isHeadOfOrder = this.authService.isHeadOfOrder();
    const isForeman = this.authService.isForeman();
    if (!isForeman && !isHeadOfOrder && !isAdmin) {
      this.router.navigate(["/pages/error"]);
    } else {
      return true;
    }
  }
}
