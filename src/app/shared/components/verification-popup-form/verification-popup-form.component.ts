import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import {
  DxButtonModule,
  DxLoadIndicatorModule,
  DxPopupModule,
} from 'devextreme-angular';
import { ScreenService } from '../../services';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'verification-popup-form',
  templateUrl: './verification-popup-form.component.html',
  styleUrl: './verification-popup-form.component.scss',
  standalone: true,
  imports: [
    DxPopupModule,
    CommonModule,
    DxButtonModule,
    DxLoadIndicatorModule,
    TranslateModule,
  ],
})
export class VerificationPopupFormComponent {
  @Input() title = '';

  @Input() message = '';

  @Input() visible = false;

  @Input() width = '450';

  @Input() height = 'auto';

  @Input() isWarningButton: boolean = false;

  @Input() isLoading: boolean = false;

  @Input() isCancelLoading: boolean = false;

  @Input() addCancelBtn: boolean = false;

  @Input() confirmButtonText: string = "Okay";

  @Input() cancelButtonText: string = "Cancel";

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() isLoadingChange = new EventEmitter<boolean>();
  @Output() isCancelLoadingChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<any>();

  constructor(
    public screen: ScreenService
  ) {}

  closePopup() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  submit() {
    this.isLoading = true;
    this.isLoadingChange.emit(true);
    this.onConfirm.emit();
  }

  cancel() {
    this.isCancelLoading = true;
    this.isCancelLoadingChange.emit(true);
    this.onCancel.emit();
  }
}
