import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const GET_EMPLOYEE = gql`
  query GetEmployee($eid: ID!) {
    searchEmployeeByEid(eid: $eid) {
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

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($eid: ID!, $input: EmployeeInput!) {
    updateEmployee(eid: $eid, input: $input) {
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

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  getEmployeeById(eid: string) {
    return this.apollo.watchQuery<any>({
      query: GET_EMPLOYEE,
      variables: { eid }
    }).valueChanges;
  }

  updateEmployee(eid: string, input: any) {
    return this.apollo.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: { eid, input }
    });
  }
}
