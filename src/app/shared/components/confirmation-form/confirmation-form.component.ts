import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DxFormModule,
  DxLoadIndicatorModule,
  DxScrollViewModule,
} from 'devextreme-angular';
import { AuthService } from '../../services';
import { CardAuthComponent } from '../card-auth/card-auth.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-form',
  templateUrl: './confirmation-form.component.html',
  styleUrls: ['./confirmation-form.component.scss'],
  standalone: true,
  imports: [
    DxFormModule,
    DxLoadIndicatorModule,
    NgIf,
    DxScrollViewModule,
    CardAuthComponent,
    TranslateModule,
  ],
})
export class ConfirmationFormComponent {
  loading = false;
  emailConfirmationToken = '';
  userId: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('userId') || '';
      this.emailConfirmationToken = params.get('token') || '';
    });

    this.route.queryParams.subscribe((params) => {
      this.emailConfirmationToken = params['token'] || '';
    });

    this.authService
      .confirmEmail(this.emailConfirmationToken, this.userId)
      .subscribe();
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.router.navigate(['/login']);
  }
}
