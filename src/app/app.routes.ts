import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
    },{
        path: 'friends',
        loadComponent: () => import('./features/friends/friends').then(m => m.Friends)
    },

    { path: '**', redirectTo: '' }
];
