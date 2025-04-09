import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <h2>Create New Employee</h2>
    <form [formGroup]="createEmployeeForm" (ngSubmit)="onSubmit()">
      <label>First Name:</label>
      <input formControlName="first_name" type="text" />

      <label>Last Name:</label>
      <input formControlName="last_name" type="text" />

      <label>Email:</label>
      <input formControlName="email" type="email" />

      <label>Gender:</label>
      <input formControlName="gender" type="text" />

      <label>Designation:</label>
      <input formControlName="designation" type="text" />

      <label>Salary:</label>
      <input formControlName="salary" type="number" />

      <label>Date of Joining:</label>
      <input formControlName="date_of_joining" type="date" />

      <label>Department:</label>
      <input formControlName="department" type="text" />

      <label>Employee Photo (URL):</label>
      <input formControlName="employee_photo" type="text" />

      <button type="submit" [disabled]="createEmployeeForm.invalid">Create Employee</button>
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      width: 300px;
      gap: 10px;
      margin-top: 20px;
    }

    label {
      font-weight: bold;
    }

    button {
      width: fit-content;
      padding: 6px 16px;
    }
  `]
})
export class EmployeeCreateComponent {
  createEmployeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private router: Router
  ) {
    this.createEmployeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      designation: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      date_of_joining: ['', Validators.required],
      department: ['', Validators.required],
      employee_photo: ['']
    });
  }

  onSubmit(): void {
    if (this.createEmployeeForm.invalid) return;

    const formValue = this.createEmployeeForm.value;

    // Convert salary string to float
    const input = {
      ...formValue,
      salary: parseFloat(formValue.salary)
    };

    const CREATE_EMPLOYEE = gql`
      mutation AddEmployee($input: EmployeeInput!) {
        addEmployee(input: $input) {
          id
          first_name
          last_name
          email
          gender
          designation
          salary
          date_of_joining
          department
          employee_photo
        }
      }
    `;

    this.apollo.mutate({
      mutation: CREATE_EMPLOYEE,
      variables: { input }
    }).subscribe({
      next: (res) => {
        console.log('✅ Employee created:', res);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Error creating employee:', error);
        if (error.graphQLErrors?.length > 0) {
          alert(`GraphQL Error: ${error.graphQLErrors[0].message}`);
        } else if (error.networkError) {
          alert('Network Error: ' + error.networkError.message);
        } else {
          alert('Unknown error occurred.');
        }
      }
    });
  }
}
