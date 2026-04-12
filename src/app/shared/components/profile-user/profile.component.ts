import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Profile, ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user!: Profile;
  form!: FormGroup;
  isOpen = false;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [''],
      firstName: [''],
      lastName: [''],
      phoneNumber: ['']
    });

    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;

        this.form.patchValue({
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber
        });
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      }
    });
  }

  openModal(): void {
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
  }

  handleSave(): void {
    this.profileService.updateMyProfile(this.form.value).subscribe({
      next: (data) => {
        this.user = data;
        this.closeModal();
      },
      error: (err) => {
        console.error('Failed to update profile', err);
      }
    });
  }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.profileService.uploadProfileImage(file).subscribe({
      next: (res) => {
    console.log('Upload response:', res);
    this.loadProfile();
  },
  error: (err) => {
    console.error('Failed to upload image', err);
  }
    });
  }
}