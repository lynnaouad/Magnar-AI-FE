import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  NgModule,
  Output,
  Input,
  SimpleChanges,
  EventEmitter,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxToolbarModule,
  DxLoadPanelModule,
  DxScrollViewModule,
  DxFormModule,
  DxValidatorModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { ScreenService } from '../../services';
import { FormPhotoComponent } from '../form-photo/form-photo.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  standalone: true,
  imports: [
    DxAccordionModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxToolbarModule,
    DxLoadPanelModule,
    DxScrollViewModule,
    DxFormModule,
    DxValidatorModule,
    DxValidationGroupModule,
    CommonModule,
    FormPhotoComponent,
    TranslateModule
  ],
})
export class PanelComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy
{
  @Input() isOpened = false;

  @Input() userId: number = 0;

  @Output() isOpenedChange = new EventEmitter<boolean>();

  formData: any;

  contactData: any;

  isLoading = false;

  isEditing = false;

  userPanelSubscriptions: Subscription[] = [];

  constructor(private screen: ScreenService, private router: Router) {}

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const { userId } = changes;

    if (userId?.currentValue) {
      this.loadUserById(userId.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.userPanelSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadUserById = (id: number) => {
    this.isLoading = true;
  };

  onSaveClick = ({ validationGroup }: DxButtonTypes.ClickEvent) => {
    if (!validationGroup.validate().isValid) return;
    this.contactData = { ...this.formData };
    this.isEditing = !this.isEditing;
  };

  toggleEdit = () => {
    this.isEditing = !this.isEditing;
  };

  cancelHandler() {
    this.toggleEdit();
    this.formData = { ...this.contactData };
  }

  navigateToDetails = () => {};
}
