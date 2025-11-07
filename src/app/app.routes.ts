import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
    },
    {
        path: 'profile-name',
        loadComponent: () => import('./features/flurr-space-profile/flurr-space-profile').then(m => m.FlurrSpaceProfile)
    },
    { path: '**', redirectTo: '' }
];
