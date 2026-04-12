import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { UserRequest } from '../models/user-request.model';
import { UserResponse } from '../models/user-response.model';
import { Organization } from '../models/organization.model';

import { UserService } from '../shared/services/user.service';
import { OrganizationService } from '../shared/services/organization.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  isEditMode = false;
  userId: number | null = null;

  organizations: Organization[] = [];

  errorMessage = '';
  successMessage = '';

  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  formErrors: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    organizationId?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  formData: UserRequest = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    picture: null,
    organizationId: 1,
    role: 'ROLE_ADMIN',
    enabled: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.loadOrganizations();

    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
    }
  }

  loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user: UserResponse) => {
        this.formData = {
          username: user.username,
          email: user.email,
          password: '',
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          picture: user.picture,
          organizationId: user.organizationId ?? 1,
          role: user.roles.length ? user.roles[0] : 'ROLE_ADMIN',
          enabled: user.enabled
        };

        this.errorMessage = '';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load user.';
      }
    });
  }

  loadOrganizations(): void {
    this.organizationService.getAllOrganizations().subscribe({
      next: (data: Organization[]) => {
        this.organizations = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.formData.username || this.formData.username.trim().length < 3) {
      this.formErrors.username = 'Username must contain at least 3 characters.';
    }

    if (!this.formData.firstName || !this.formData.firstName.trim()) {
      this.formErrors.firstName = 'First name is required.';
    }

    if (!this.formData.lastName || !this.formData.lastName.trim()) {
      this.formErrors.lastName = 'Last name is required.';
    }

    if (!this.formData.email || !this.formData.email.trim()) {
      this.formErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.formErrors.email = 'Invalid email format.';
    }

    if (!this.formData.phoneNumber || !this.formData.phoneNumber.trim()) {
      this.formErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^[0-9]+$/.test(this.formData.phoneNumber)) {
      this.formErrors.phoneNumber = 'Phone number must contain only digits.';
    }

    if (!this.formData.role) {
      this.formErrors.role = 'Role is required.';
    }

    if (!this.formData.organizationId) {
      this.formErrors.organizationId = 'Organization is required.';
    }

    if (!this.isEditMode) {
      if (!this.formData.password) {
        this.formErrors.password = 'Password is required.';
      } else if (this.formData.password.length < 6) {
        this.formErrors.password = 'Password must contain at least 6 characters.';
      }

      if (!this.confirmPassword) {
        this.formErrors.confirmPassword = 'Confirm password is required.';
      } else if (this.formData.password !== this.confirmPassword) {
        this.formErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  submitForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) {
      return;
    }

    if (!this.isEditMode) {
      console.log('CREATE PAYLOAD', this.formData);

      this.userService.createUser(this.formData).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            'Failed to create user.';
        }
      });
    } else if (this.userId) {
      const updatePayload = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        phoneNumber: this.formData.phoneNumber,
        picture: this.formData.picture,
        enabled: this.formData.enabled,
        organizationId: this.formData.organizationId,
        role: this.formData.role
      };

      console.log('UPDATE PAYLOAD', updatePayload);

      this.userService.updateUser(this.userId, updatePayload).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage =
            err?.error?.message ||
            err?.error?.error ||
            'Failed to update user.';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}