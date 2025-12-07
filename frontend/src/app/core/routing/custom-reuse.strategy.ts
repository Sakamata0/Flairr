import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
} from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  // ✅ Build FULL stable route path including parents
  private getFullRoutePath(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
      .map(r => r.routeConfig?.path)
      .filter(p => p !== undefined)
      .join('/');
  }

  // ✅ Choose which routes to cache
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const fullPath = this.getFullRoutePath(route);

    const cacheableRoutes = [
      '',
      'messages',
      'spaces',
      'friends',
      'notifications',
      'profile',
      'profile/:profileId'
    ];

    return cacheableRoutes.some(r => fullPath.endsWith(r));
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const fullPath = this.getFullRoutePath(route);
    this.storedRoutes.set(fullPath, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const fullPath = this.getFullRoutePath(route);
    return this.storedRoutes.has(fullPath);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const fullPath = this.getFullRoutePath(route);
    return this.storedRoutes.get(fullPath) || null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // ✅ FOR LOGOUT FIX
  clearCache() {
    this.storedRoutes.clear();
  }
}
