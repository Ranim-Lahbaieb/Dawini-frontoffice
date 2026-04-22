import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin-form.component.html'
})
export class SigninFormComponent {
  email = '';
  password = '';
  showPassword = false;
  isChecked = false;

  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  signInWithGoogle(): void {
    window.location.href = 'http://localhost:8020/api/oauth2/authorization/google';
  }

  onSignIn(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;

        // 2FA required
        if (res.requires2fa) {
          localStorage.setItem('pending2faUser', res.email || this.email);
          this.router.navigate(['/verify-2fa']);
          return;
        }

        // Normal login
        if (res.accessToken) {
          localStorage.setItem('token', res.accessToken);
        }

        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'Invalid email or password.';
      }
    });
  }
}