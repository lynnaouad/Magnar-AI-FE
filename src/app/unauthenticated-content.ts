import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthenticated-content',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
],
})
export class UnauthenticatedContentComponent {

  constructor() { }
}