import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxPopupModule,
  DxFormModule,
  DxTextAreaModule,
  DxButtonModule,
  DxValidationGroupModule,
  DxFileUploaderModule,
  DxSelectBoxModule,
  DxLoadIndicatorModule,
  DxSwitchModule,
  DxFormComponent,
} from 'devextreme-angular';
import { DxiButtonModule } from 'devextreme-angular/ui/nested';
import { finalize, Observable, of, switchMap, take, tap } from 'rxjs';
import { ScreenService } from '../../../../shared/services';
import { LanguageService } from '../../../../shared/services/language.service';
import { ProvidersService } from '../../../../shared/services/providers.service';
import { TypesService } from '../../../../shared/services/types.service';
import { ToastNotificationManager } from '../../../../shared/utils/toast-notification.service';
import { ProviderDto } from '../../../../Dtos/ProviderDto';
import { ActivatedRoute, Params, Route, Router } from '@angular/router';

@Component({
  selector: 'app-provider-configuration',
  standalone: true,
  templateUrl: './provider-configuration.component.html',
  styleUrl: './provider-configuration.component.scss',
  imports: [
    TranslateModule,
    DxPopupModule,
    CommonModule,
    DxFormModule,
    DxTextAreaModule,
    DxButtonModule,
    DxValidationGroupModule,
    DxFileUploaderModule,
    DxiButtonModule,
    DxSelectBoxModule,
    DxLoadIndicatorModule,
    DxSwitchModule,
  ],
})
export class ProviderConfigurationComponent implements OnInit {
  nextLoading: boolean = false;
  providerTypes: any[] = [];
  data: ProviderDto = new ProviderDto();
  isCreateForm: boolean = true;

  @ViewChild('createProviderForm', { static: false })
  form!: DxFormComponent;
  constructor(
    protected screen: ScreenService,
    private typesService: TypesService,
    private languageService: LanguageService,
    private providerService: ProvidersService,
    private toastNoatification: ToastNotificationManager,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getProviderTypes()
      .pipe(
        switchMap(() => this.route.paramMap), // wait for types first
        switchMap((pm) => {
          const id = +(pm.get('id') ?? 0);
          if (id > 0) {
            this.isCreateForm = false;
            return this.getProvider(id); // load provider
          } else {
            this.isCreateForm = true;
            this.data = new ProviderDto();
            return of(null);
          }
        })
      )
      .subscribe();
  }

  getProvider(id: number): Observable<ProviderDto> {
    return this.providerService.get(id).pipe(
      tap((p) => {
        this.data = p;
        this.data.type = this.providerTypes.find(
          (x) => x.name === this.data.type
        ).id;
      })
    );
  }

  getProviderTypes(): Observable<any[]> {
    return this.typesService.get('ProviderTypes').pipe(
      tap(
        (types) =>
          (this.providerTypes = types.map((item: any) => {
            item.nameTranslated = this.languageService.translateInstant(
              item.name
            );
            return item;
          }))
      )
    );
  }

  next() {
    this.nextLoading = true;
    if (!this.form?.instance?.validate().isValid) {
      this.nextLoading = false;
      return;
    }
    // SQL Provider
    if (this.data.type === 1) {
      this.testConnection();
      return;
    }
  }

  testConnection() {
    this.providerService
      .TestConnection(this.data)
      .pipe(
        tap(
          (res) => {
            if (res) {
              this.createProvider();
            } else {
              this.nextLoading = false;
              this.toastNoatification.warning('Errors.ConnectionFailed');
            }
          },
          () => {
            this.nextLoading = false;
          }
        )
      )
      .subscribe();
  }

  cancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  createProvider() {
    this.providerService
      .create(this.data)
      .pipe(finalize(() => (this.nextLoading = false)))
      .subscribe((res: number) => {
        if (res) {
          this.data.id = res;
          this.goToDatabaseSchema();
        }
      });
  }

  updateProvider() {
    this.providerService
      .update(this.data)
      .pipe(finalize(() => (this.nextLoading = false)))
      .subscribe((res: number) => {
        this.toastNoatification.success(
          'ToastNotifications.RecordUpdatedSuccessfully'
        );
        this.router.navigate(['.'], { relativeTo: this.route.parent });
      });
  }

  goToDatabaseSchema() {
    console.log(this.data);

    this.router.navigate([`providers/${this.data.id}/database-schema`], {
      relativeTo: this.route.parent,
    });
  }
}
