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
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { ValidationRule } from 'devextreme-angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'form-selectbox',
  templateUrl: './form-selectbox.component.html',
  styleUrl: '../form-textbox/form-textbox.component.scss',
  standalone: true,
  imports: [
    DxButtonModule,
    DxTextBoxModule,
    DxValidatorModule,
    CommonModule,
    DxSelectBoxModule,
    TranslateModule,
  ],
})
export class FormSelectboxComponent {
  @Input() isEditing = false;

  @Input() text: string = '';

  @Input() label = '';

  @Input() icon: string = '';

  @Input() validators: ValidationRule[] = [];

  @Input() value!: string;

  @Input() items: any[] = [];

  @Input() displayExpr: string = '';

  @Input() valueExpr: string = '';

  @Output() valueChange = new EventEmitter<string>();

  @Output() onValueChange = new EventEmitter<string>();

  valueChanged(e: any) {
    this.valueChange.emit(e.value);
    this.onValueChange.emit(e.value);
  }
  
  constructor() {}
}
