import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatSortModule],
  template: `
    <div *ngIf="!isLoading; else loading">
      <h1>Welcome, {{ username }}!</h1>
      <button mat-raised-button color="primary" (click)="createEmployee()">Add Employee</button>

      <h2>Employee List</h2>
      <table mat-table [dataSource]="employees" class="mat-elevation-z8">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Name </th>
          <td mat-cell *matCellDef="let employee">{{ employee.first_name }} {{ employee.last_name }}</td>
        </ng-container>

        <ng-container matColumnDef="designation">
          <th mat-header-cell *matHeaderCellDef> Designation </th>
          <td mat-cell *matCellDef="let employee">{{ employee.designation }}</td>
        </ng-container>

        <ng-container matColumnDef="salary">
          <th mat-header-cell *matHeaderCellDef> Salary </th>
          <td mat-cell *matCellDef="let employee">{{ employee.salary | currency }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let employee">
            <button mat-button (click)="editEmployee(employee.id)">Edit</button>
            <button mat-button color="warn" (click)="deleteEmployee(employee.id)">Delete</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>

    <ng-template #loading>
      <p>Loading dashboard...</p>
    </ng-template>
  `,
  styles: [`
    h1, h2 {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    button {
      margin-right: 5px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  employees: any[] = [];
  username: string | null = null;
  isLoading: boolean = true;
  displayedColumns: string[] = ['name', 'designation', 'salary', 'actions'];

  constructor(
    private apollo: Apollo,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.username = decoded?.username || decoded?.email || 'User';
    } else {
      this.router.navigate(['/login']);
    }

    this.loadEmployees();
  }

  loadEmployees(): void {
    const GET_EMPLOYEES = gql`
      query {
        getAllEmployees {
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

    this.apollo.watchQuery<any>({
      query: GET_EMPLOYEES,
    }).valueChanges.subscribe({
      next: (result) => {
        console.log('✅ Employees loaded:', result);
        this.employees = result?.data?.getAllEmployees || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('🚨 Error loading employees:', err);
        this.isLoading = false;
      }
    });
  }

  createEmployee(): void {
    this.router.navigate(['/employee-create']);
  }

  editEmployee(id: string): void {
    this.router.navigate([`/employee-edit/${id}`]);
  }

  deleteEmployee(id: string): void {
    const DELETE_EMPLOYEE = gql`
      mutation DeleteEmployee($id: ID!) {
        deleteEmployee(eid: $id)
      }
    `;

    this.apollo.mutate({
      mutation: DELETE_EMPLOYEE,
      variables: { id },
    }).subscribe({
      next: () => {
        this.loadEmployees(); // Refresh list
      },
      error: (err) => {
        console.error('🚨 Error deleting employee:', err);
      }
    });
  }
}
