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
  DxNumberBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { ValidationRule } from 'devextreme-angular/common';
@Component({
  selector: 'form-numberbox',
  templateUrl: './form-numberbox.component.html',
  styleUrl: '../form-textbox/form-textbox.component.scss',
  standalone: true,
  imports: [
    DxButtonModule,
    DxTextBoxModule,
    DxValidatorModule,
    CommonModule,
    DxNumberBoxModule,
  ],
})
export class FormNumberboxComponent {
  @Input() isEditing = false;

  @Input() text: string = '';

  @Input() label = '';

  @Input() mask: string = '';

  @Input() icon: string = '';

  @Input() validators: ValidationRule[] = [];

  @Input() value!: number;

  @Output() valueChange = new EventEmitter<string>();

  valueChanged(e: any) {
    this.valueChange.emit(e.value);
  }

  constructor() {}
}
