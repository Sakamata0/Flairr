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
    },{
        path: 'Suggestions',
        loadComponent: () => import('./features/friends-suggestions/friends-suggestions').then(m => m.friendsSuggestions)
    },{
        path: 'Follow Request',
        loadComponent: () => import('./features/friends/friends').then(m => m.Friends)
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
    {
        path: 'profile-name',
        loadComponent: () => import('./features/flurr-space-profile/flurr-space-profile').then(m => m.FlurrSpaceProfile)
    },
    { path: '**', redirectTo: '' }
];
