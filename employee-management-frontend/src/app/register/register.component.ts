import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="register-container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div>
          <label>First Name</label>
          <input formControlName="first_name" type="text" />
        </div>

        <div>
          <label>Last Name</label>
          <input formControlName="last_name" type="text" />
        </div>

        <div>
          <label>Username</label>
          <input formControlName="username" type="text" />
        </div>

        <div>
          <label>Email</label>
          <input formControlName="email" type="email" />
        </div>

        <div>
          <label>Password</label>
          <input formControlName="password" type="password" />
        </div>

        <div>
          <label>Confirm Password</label>
          <input formControlName="confirmPassword" type="password" />
        </div>

        <button type="submit" [disabled]="registerForm.invalid">Register</button>
      </form>

      <div *ngIf="successMessage" style="color: green;">{{ successMessage }}</div>
      <div *ngIf="errorMessage" style="color: red;">{{ errorMessage }}</div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router
  ) {
    // We build the registration form with form controls.
    // Each field must be filled, email must be valid, password at least 6 chars.
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  // We use this to ensure password and confirmPassword match
  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Called when the form is submitted
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { first_name, last_name, username, email, password } = this.registerForm.value;

    // Define the GraphQL mutation for registration
    const REGISTER_MUTATION = gql`
      mutation signup($first_name: String!, $last_name: String!, $username: String!, $email: String!, $password: String!) {
        signup(first_name: $first_name, last_name: $last_name, username: $username, email: $email, password: $password) {
          id
          username
          email
        }
      }
    `;

    // Call the GraphQL API using Apollo
    this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { first_name, last_name, username, email, password }
    }).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        this.errorMessage = null;

        // After success, wait 2 seconds then redirect to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.successMessage = null;
        this.errorMessage = 'Registration failed: ' + err.message;
      }
    });
  }
}