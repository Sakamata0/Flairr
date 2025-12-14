import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const logged = await this.auth.isLoggedIn();
    if (logged) {
      this.router.navigate(['/']); 
      return false;
    }
    return true;
  }
}