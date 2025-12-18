import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Wait briefly for the auth service to complete its initial session restoration
    console.debug('[AuthGuard] canActivate: platformIsBrowser=', isPlatformBrowser(this.platformId));

    // If server-side rendering, don't block navigation here — the browser will handle auth checks.
    if (!isPlatformBrowser(this.platformId)) {
      console.debug('[AuthGuard] running on server - allowing navigation');
      return true;
    }

    console.debug('[AuthGuard] canActivate: waiting for session restore');
    await this.authService.waitForSessionRestore(800);

    // Now check auth state
    const loggedIn = await this.authService.checkAuth();
    console.debug('[AuthGuard] canActivate: loggedIn=', loggedIn, 'url=', state?.url);

    if (loggedIn) {
      return true;
    }

    // preserve attempted URL so the user can be returned after signin
    const attemptedUrl = state?.url || '/';
    this.router.navigate(['/signin'], { queryParams: { redirectTo: attemptedUrl } });
    return false;
  }
}