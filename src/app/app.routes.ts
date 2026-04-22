import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { UserListComponent } from './shared/components/users-list/users-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { SigninFormComponent } from './shared/components/auth/signin-form/signin-form.component';
import { AuthGuard } from './guards/auth.guard';
import { Oauth2SuccessComponent } from './oauth2-success/oauth2-success.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { ChatComponent } from './shared/components/chat/chat.component';

export const routes: Routes = [

  // 🔐 Partie protégée
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
        title: 'Profile | Dawini'
      },
      {
        path: 'users',
        component: UserListComponent
      },
      {
        path: 'chat',
        component: ChatComponent,
        title: 'Chat | Dawini'
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

  // 🔓 2FA (hors AuthGuard)
  {
    path: 'verify-2fa',
    loadComponent: () =>
      import('./shared/components/verify2fa/verify2fa.component')
        .then(c => c.Verify2faComponent)
  },

  // 🔓 Auth pages
  {
    path: 'signin',
    component: SigninFormComponent
  },
  {
    path: 'oauth2-success',
    component: Oauth2SuccessComponent
  },

  // ❌ Not found
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Not Found | Dawini'
  }
];