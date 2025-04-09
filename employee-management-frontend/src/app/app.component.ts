import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true, // Required for standalone components
  imports: [RouterModule, CommonModule], // Necessary for router-outlet and common directives
  template: `
    <div class="app-container">
      <router-outlet></router-outlet> <!-- Routed components load here -->
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
    }
  `]
})
export class AppComponent {}
