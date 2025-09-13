import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-authorized-container',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      width: 100% !important;
      height: 100%;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
})
export class NotAuthorizedContainerComponent {

  constructor() { }

}