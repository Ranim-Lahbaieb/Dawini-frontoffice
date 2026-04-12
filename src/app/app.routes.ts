import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { UserListComponent } from './shared/components/users-list/users-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { SigninFormComponent } from './shared/components/auth/signin-form/signin-form.component';
import { AuthGuard } from './guards/auth.guard';
import { Oauth2SuccessComponent } from './oauth2-success/oauth2-success.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ChatComponent } from './shared/components/chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: EcommerceComponent,
        title: 'Dashboard | Dawini'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Angular Profile Dashboard | TailAdmin - Angular Admin Dashboard Template'
      },
      {
        path: 'users',
        component: UserListComponent
      },
      {
        path: 'chat',
        component: ChatComponent, 
        title: 'Messagerie | Dawini'
      },
      {
        path: 'users/add',
        component: UserFormComponent
      },
      {
        path: 'users/edit/:id',
        component: UserFormComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'signin',
    component: SigninFormComponent
  },
  {
    path: 'oauth2-success',
    component: Oauth2SuccessComponent
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Angular NotFound Dashboard | Dawini - Angular Admin Dashboard Template'
  }
];