import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css'],
})
export class EmployeeEditComponent implements OnInit {
  employeeId: string = '';  // Default value of '' (empty string)
  editEmployeeForm: FormGroup;

  constructor(
    private route: ActivatedRoute,  // ActivatedRoute is used to get route params
    private apollo: Apollo,
    private fb: FormBuilder
  ) {
    this.editEmployeeForm = this.fb.group({
      name: ['', [Validators.required]],
      position: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Get the employee ID from the route parameter
    this.employeeId = this.route.snapshot.paramMap.get('id') || '';  // Assign '' if no id found
    
    // Fetch employee data
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
    const GET_EMPLOYEE = gql`
      query GetEmployee($id: ID!) {
        employee(id: $id) {
          id
          first_name
          last_name
          position
          salary
        }
      }
    `;

    this.apollo
      .watchQuery({
        query: GET_EMPLOYEE,
        variables: { id: this.employeeId },
      })
      .valueChanges.subscribe((result: any) => {
        const employee = result?.data?.employee;
        if (employee) {
          this.editEmployeeForm.patchValue({
            name: `${employee.first_name} ${employee.last_name}`,
            position: employee.position,
            salary: employee.salary
          });
        }
      });
  }

  onSubmit(): void {
    if (this.editEmployeeForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const UPDATE_EMPLOYEE = gql`
      mutation UpdateEmployee($id: ID!, $name: String!, $position: String!, $salary: Float!) {
        updateEmployee(id: $id, name: $name, position: $position, salary: $salary) {
          id
          name
          position
          salary
        }
      }
    `;

    const employeeData = this.editEmployeeForm.value;
    this.apollo
      .mutate({
        mutation: UPDATE_EMPLOYEE,
        variables: { id: this.employeeId, ...employeeData },
      })
      .subscribe({
        next: () => {
          console.log('Employee updated successfully');
        },
        error: (err) => {
          console.error('Error updating employee:', err);
        },
      });
  }
}
