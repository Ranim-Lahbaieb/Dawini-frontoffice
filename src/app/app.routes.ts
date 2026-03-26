import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { UsersListComponent } from './shared/components/users-list/users-list.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'users',
        component: UsersListComponent
      }
    ]
  },

  {
    path: 'signin',
    component: SignInComponent
  },

  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template'
  }
];