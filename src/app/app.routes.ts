import { Routes } from '@angular/router';
import { DefaultLayout } from './layouts/default-layout/default-layout';
import { SimpleLayout } from './layouts/simple-layout/simple-layout';
import { AuthGuard } from './auth/auth.guard';
import { NoAuthGuard } from './auth/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout, // Layout with header
    canActivate: [AuthGuard],   // <----- PROTECT EVERYTHING
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
      },
      {
        path: 'profile/:profileId',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile)
      },
      {
        path: 'friends',
        loadComponent: () => import('./features/friends/friends').then(m => m.Friends)
      },
      {
        path: 'spaces',
        loadComponent: () => import('./features/spaces/spaces').then(m => m.Spaces)
      },
      {
        path: 'spaces/:spaceId',
        loadComponent: () => import('./features/flurr-space-profile/flurr-space-profile').then(m => m.FlurrSpaceProfile)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/messages').then(m => m.Messages)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications').then(m => m.Notifications)
      }
    ]
  },
  {
    path: '',
    component: SimpleLayout, // Layout without header
    children: [
      {
        path: 'login',
        canActivate: [NoAuthGuard],
        loadComponent: () => import('./features/login/login').then(m => m.Login)
      },
      {
        path: 'signup',
        canActivate: [NoAuthGuard],
        loadComponent: () => import('./features/signup/signup').then(m => m.Signup)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];