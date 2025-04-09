// src/app/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // Assuming API URL is set in environment.ts

  constructor(private http: HttpClient) {}

  // Login method to authenticate the user
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }

  // Method to store the user and token in localStorage or sessionStorage
  loginUser(user: any, token: string): void {
    localStorage.setItem('user', JSON.stringify(user)); // Store the user data in localStorage
    localStorage.setItem('token', token); // Store the JWT token in localStorage
  }

  // Check if the user is logged in (i.e., if token exists in localStorage)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Method to logout the user by clearing the session data
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Get the stored user data (if any)
  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  // Get the stored token (if any)
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
