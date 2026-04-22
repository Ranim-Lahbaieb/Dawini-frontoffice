import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Import de Validators
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
    // Ajout des contrôles de saisie (Validators)
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.email]], // Obligatoire + Format Email
      firstName: ['', [Validators.required, Validators.minLength(2)]], // Obligatoire + min 2 caractères
      lastName: ['', [Validators.required, Validators.minLength(2)]], // Obligatoire + min 2 caractères
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+ ]{8,}$')]] // Chiffres, +, espaces, min 8 carac.
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
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  // Optionnel : Helper pour vérifier la validité dans le HTML
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  handleSave(): void {
    if (this.form.valid) {
      this.profileService.updateMyProfile(this.form.value).subscribe({
        next: (data) => {
          this.user = data;
          // Si vous utilisez une modale, fermez-la ici. 
          // Si le formulaire est directement sur la page, vous pouvez afficher un message de succès.
          this.isOpen = false; 
          alert('Profile updated successfully!');
        },
        error: (err) => console.error('Failed to update profile', err)
      });
    } else {
      // Marquer tous les champs comme "touched" pour afficher les erreurs si l'utilisateur clique sur submit
      this.form.markAllAsTouched();
    }
  }

  // Les autres méthodes restent identiques...
  openModal(): void { this.isOpen = true; }
  closeModal(): void { this.isOpen = false; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    this.profileService.uploadProfileImage(file).subscribe({
      next: (res) => {
        console.log('Upload response:', res);
        this.loadProfile();
      },
      error: (err) => console.error('Failed to upload image', err)
    });
  }
}