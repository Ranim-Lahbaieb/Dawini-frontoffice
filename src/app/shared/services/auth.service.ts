import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8020/api';

  // ✅ user global (IMPORTANT)
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ================= LOGIN =================
  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('connectedUser', JSON.stringify(res));

        // ✅ charger user après login
        this.loadUser();
      })
    );
  }

  // ================= LOGOUT =================
  logout() {
    localStorage.clear();
    this.userSubject.next(null); // ✅ reset user
    this.router.navigate(['/signin'], { replaceUrl: true });
  }

  // ================= TOKEN =================
  getToken(): string | null {
    const token = localStorage.getItem('token');

    if (token && this.isTokenExpired(token)) {
      this.logout(); // ✅ important
      return null;
    }

    return token;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);

      if (!decoded.exp) return false;

      return decoded.exp * 1000 - 5000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ================= USER =================

  // ✅ charger user depuis backend
  loadUser() {
    this.http.get(`${this.apiUrl}/users/me`)
      .subscribe({
        next: (user) => {
          this.userSubject.next(user);
        },
        error: () => {
          this.logout(); // si erreur token invalide
        }
      });
  }

  // ✅ récupérer user actuel
  getUser() {
    return this.userSubject.value;
  }
}