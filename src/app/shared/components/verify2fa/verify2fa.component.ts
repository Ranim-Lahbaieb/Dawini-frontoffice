import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify2fa.component.html'
})
export class Verify2faComponent {
  code = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  verifyCode() {
    const username = localStorage.getItem('pending2faUser');
    if (!username || !this.code.trim()) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.verify2fa(username, this.code).subscribe({
      next: (res) => {
        this.loading = false;
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.removeItem('pending2faUser');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid verification code';
      }
    });
  }
}