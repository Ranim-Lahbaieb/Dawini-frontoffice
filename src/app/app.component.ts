import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

  title = 'Angular Ecommerce Dashboard | TailAdmin';

  constructor(private authService: AuthService) {} // 

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.loadUser(); // 
    }
  }
}