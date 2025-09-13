import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { ValidationRule } from 'devextreme-angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'form-textbox',
  templateUrl: './form-textbox.component.html',
  styleUrl: './form-textbox.component.scss',
  standalone: true,
  imports: [
    DxButtonModule,
    DxTextBoxModule,
    DxValidatorModule,
    CommonModule,
    TranslateModule,
  ],
})
export class FormTextboxComponent {
  @Input() isEditing = false;

  @Input() text: string = '';

  @Input() label = '';

  @Input() mask: string = '';

  @Input() placeHolder: string | null | undefined;

  @Input() icon: string = '';

  @Input() validators: ValidationRule[] = [];

  @Input() value!: string;

  @Output() valueChange = new EventEmitter<string>();

  valueChanged(e: any) {
    this.valueChange.emit(e.value);
  }

  constructor() {}
}
