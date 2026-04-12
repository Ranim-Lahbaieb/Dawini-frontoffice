import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { UserResponse } from '../../../../models/user-response.model';

@Component({
  selector: 'app-users-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-stats.component.html',
})
export class UsersStatsComponent implements OnInit {
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;
  adminCount = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: UserResponse[]) => {
        const activeUsers = users.filter(u => !u.deleted && u.enabled);
        const inactiveUsers = users.filter(u => !u.deleted && !u.enabled);
        const admins = users.filter(u => !u.deleted && u.roles.includes('ROLE_ADMIN'));

        this.totalUsers = users.filter(u => !u.deleted).length;
        this.activeUsers = activeUsers.length;
        this.inactiveUsers = inactiveUsers.length;
        this.adminCount = admins.length;
      },
      error: (err) => {
        console.error('Failed to load user stats:', err);
      }
    });
  }
}
