import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { JwtAuthService } from "../services/auth/jwt-auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = true; // Set this value dynamically

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log("canActivate()");

    // if (this.isAuthenticated) {
    //   return true;
    // }
    this.authToken = localStorage.getItem('authToken');
    if (this.authToken != null && this.authToken != "") {
      return true;
    }

    this.router.navigate(['/sessions/signin']);
    return false;
  }
}
