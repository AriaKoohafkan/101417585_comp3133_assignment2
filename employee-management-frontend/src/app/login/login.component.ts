import { Component } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div>
          <label>Email:</label>
          <input formControlName="email" type="email" />
        </div>

        <div>
          <label>Password:</label>
          <input formControlName="password" type="password" />
        </div>

        <button type="submit" [disabled]="loginForm.invalid">Login</button>
      </form>

      <p *ngIf="successMessage" style="color: green;">{{ successMessage }}</p>
      <p *ngIf="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  `,
  styles: [`
    .login-container {
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      margin-bottom: 15px;
    }
    button {
      padding: 10px 20px;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill out the form correctly!';
      return;
    }

    const credentials = this.loginForm.value;

    this.http.post<{ token: string }>('http://localhost:5000/login', credentials)
      .subscribe({
        next: (response) => {
          const token = response.token;

          if (token) {
            localStorage.setItem('token', token);
            console.log('✅ Token stored:', token);
            this.successMessage = 'Login successful!';

            // Navigate to /dashboard and log the outcome.
            this.router.navigate(['/dashboard']).then(success => {
              if (success) {
                console.log('✅ Navigation successful!');
              } else {
                console.error('❌ Navigation failed!');
              }
            });
          }
        },
        error: (err) => {
          console.error('❌ Login error:', err);
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      });
  }
}
