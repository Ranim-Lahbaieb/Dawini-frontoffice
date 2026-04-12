import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../../models/user-response.model';
import { UserRequest } from '../../../models/user-request.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-list.component.html'
})
export class UserListComponent implements OnInit {

  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];

  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';
  errorMessage = '';
  successMessage = '';

  currentPage = 1;
  itemsPerPage = 6;

  showForm = false;
  isEditMode = false;
  selectedUserId: number | null = null;
  selectedUserDetail: UserResponse | null = null;
  showDetailModal = false;

  roles = [
    'ROLE_ADMIN',
    'ROLE_DOCTOR',
    'ROLE_PHARMACIST',
    'ROLE_NUTRITIONIST',
    'ROLE_AMBULANCIER',
    'ROLE_BIOMEDICAL_ENGINEER',
    'ROLE_COORDINATOR'
  ];

  formData: UserRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    picture: null,
    organizationId: 1,
    role: 'ROLE_ADMIN'
  };

  constructor(private userService: UserService,
  private router: Router) {}

  ngOnInit(): void {
    
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data.filter(user => !user.deleted);
        this.filteredUsers = [...this.users];
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load users.';
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredUsers = this.users.filter(user => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.organizationName ?? '').toLowerCase().includes(term) ||
        user.roles.join(' ').toLowerCase().includes(term);

      const matchesRole = !this.selectedRole || user.roles.includes(this.selectedRole);

      const matchesStatus =
        !this.selectedStatus || 
        (this.selectedStatus === 'enabled' && user.enabled) ||
        (this.selectedStatus === 'disabled' && !user.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  get paginatedUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

 openAddForm(): void {
  this.router.navigate(['/users/add']);
}

  openEditForm(user: UserResponse): void {
  this.router.navigate(['/users/edit', user.id]);
}

  viewUserDetail(user: UserResponse): void {
    this.selectedUserDetail = user;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedUserDetail = null;
  }

  closeForm(): void {
    this.showForm = false;
  }

  submitForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode && this.selectedUserId) {
      const updatePayload = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        phoneNumber: this.formData.phoneNumber,
        picture: this.formData.picture,
        enabled: true
      };

      this.userService.updateUser(this.selectedUserId, updatePayload).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully.';
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to update user.';
        }
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: () => {
          this.successMessage = 'User created successfully.';
          this.showForm = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to create user.';
        }
      });
    }
  }

  deleteUser(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this user?');

    if (!confirmed) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully.';
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete user.';
      }
    });
  }
}