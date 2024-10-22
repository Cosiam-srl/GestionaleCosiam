import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorPageComponent } from './error/error-page.component';
import { ForgotPasswordPageComponent } from './forgot-password/forgot-password-page.component';
import { LoginPageComponent } from './login/login-page.component';
import { ResetPasswordPageComponent } from './reset-password/reset-password-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: ErrorPageComponent,
        data: {
          title: 'Error Page'
        }
      },
      {
        path: 'login',
        component: LoginPageComponent,
        data: {
          title: 'Login Page'
        }
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent,
        data: {
          title: 'Forgot Password'
        }
      },
      {
        path: 'reset-password',
        component: ResetPasswordPageComponent,
        data: {
          title: 'Reset Password'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
