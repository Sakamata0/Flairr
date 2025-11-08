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
        path: 'spaces',
        loadComponent: () => import('./features/spaces/spaces').then(m => m.Spaces)
    },
    // aandek ismail
    /*{
        path: 'spaces/:spaceId',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
    },*/
    { path: '**', redirectTo: '' }
];
