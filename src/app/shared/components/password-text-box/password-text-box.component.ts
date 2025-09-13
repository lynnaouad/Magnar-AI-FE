import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DxSelectBoxModule, DxTextBoxModule, DxValidatorComponent, DxValidatorModule } from 'devextreme-angular';
import { ValidationRule, EditorStyle } from 'devextreme-angular/common';
import { DxoLabelModule } from 'devextreme-angular/ui/nested';

@Component({
  selector: 'password-text-box',
  templateUrl: './password-text-box.component.html',
  styleUrls: ['./password-text-box.component.scss'],
  standalone: true,
  imports: [
    DxSelectBoxModule,
    DxTextBoxModule,
    DxValidatorModule,
    CommonModule,
    TranslateModule,
    DxoLabelModule
  ],
})
export class PasswordTextBoxComponent {
  @ViewChild('validator', { static: true })
  validator!: DxValidatorComponent;

  @Input() value: any = '';
  @Input() placeholder = '';
  @Input() stylingMode: EditorStyle = 'outlined';
  @Input() validators: ValidationRule[] = [];
  @Input() label = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() valueChanged = new EventEmitter<string>();

  isPasswordMode = true;

  constructor() {}

  switchMode = () => {
    this.isPasswordMode = !this.isPasswordMode;
  };

  onValueChange(value: any) {
    this.value = value;
    this.valueChange.emit(value);
    this.valueChanged.emit(value);
  }

  // Method to trigger validation manually
  validate(): boolean | undefined {
    const validationResult = this.validator.instance.validate();
    return validationResult.isValid;
  }
}