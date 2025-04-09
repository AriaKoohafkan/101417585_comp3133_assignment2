import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Edit Employee</h2>

      <form [formGroup]="employeeForm" (ngSubmit)="updateEmployee()">
        <div *ngIf="isLoading">Loading...</div>

        <div *ngIf="!isLoading">
          <label>First Name:</label>
          <input type="text" formControlName="first_name" />

          <label>Last Name:</label>
          <input type="text" formControlName="last_name" />

          <label>Email:</label>
          <input type="email" formControlName="email" />

          <label>Gender:</label>
          <select formControlName="gender">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label>Designation:</label>
          <input type="text" formControlName="designation" />

          <label>Salary:</label>
          <input type="number" formControlName="salary" />

          <label>Date of Joining:</label>
          <input type="date" formControlName="date_of_joining" />

          <label>Department:</label>
          <input type="text" formControlName="department" />

          <label>Photo URL:</label>
          <input type="file" (change)="onFileChange($event)" />

          <button type="submit" [disabled]="isUploading">Update</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 500px;
      margin: auto;
      padding: 20px;
      background: #f8f8f8;
      border-radius: 8px;
    }
    h2 {
      text-align: center;
    }
    label {
      display: block;
      margin-top: 15px;
    }
    input, select {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
    }
    button {
      margin-top: 20px;
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  `]
})
export class EmployeeEditComponent implements OnInit {
  employeeId: string | null = null;
  employeeForm!: FormGroup;
  isLoading: boolean = false;
  isUploading: boolean = false;  // Flag to disable submit while uploading photo
  employeePhotoPath: string | null = null;  // To hold the file path from REST upload

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private http: HttpClient  // Inject HttpClient to make REST API call
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      gender: [''],
      designation: [''],
      salary: [0],
      date_of_joining: [''],
      department: [''],
      employee_photo: [''],
    });

    this.employeeId = this.route.snapshot.paramMap.get('id');

    if (this.employeeId) {
      this.loadEmployeeData(this.employeeId);
    } else {
      console.error('Employee ID not found in URL.');
    }
  }

  loadEmployeeData(id: string) {
    this.isLoading = true;
    this.employeeService.getEmployeeById(id).subscribe({
      next: (result) => {
        const data = result?.data?.searchEmployeeByEid;
        if (data) {
          this.employeeForm.patchValue(data);
          this.employeePhotoPath = data.employee_photo;  // Store current photo URL
        } else {
          console.warn('No employee found with given ID.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.isLoading = false;
      },
    });
  }

  // Handle file selection and upload the photo
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Make REST API call to upload the photo
      this.http.post<{ path: string }>(`${environment.apiBaseUrl}/api/upload-photo`, formData)
        .subscribe({
          next: (response) => {
            this.employeePhotoPath = response.path;  // Get the uploaded file path
            this.isUploading = false;
          },
          error: (error) => {
            console.error('Error uploading photo:', error);
            this.isUploading = false;
            alert('Error uploading photo');
          }
        });
    }
  }

  updateEmployee() {
    if (this.employeeForm.valid && this.employeeId) {
      const updatedData = {
        ...this.employeeForm.value,
        employee_photo: this.employeePhotoPath || this.employeeForm.value.employee_photo  // Use the uploaded photo path if available
      };

      this.employeeService.updateEmployee(this.employeeId, updatedData).subscribe({
        next: (res) => {
          console.log('Employee updated successfully:', res);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error updating employee:', err);
        },
      });
    } else {
      console.error('Form invalid or employee ID missing.');
    }
  }
}
