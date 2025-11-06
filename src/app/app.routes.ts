import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    // Example additional lazy route:
    // { path: 'spaces', loadComponent: () => import('./features/spaces/spaces').then(m => m.SpacesComponent) },
    { path: '**', redirectTo: '' }
];
