import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersStatsComponent } from '../../../shared/components/common/users-stats/users-stats.component';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [
    CommonModule,
    UsersStatsComponent
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent {}
