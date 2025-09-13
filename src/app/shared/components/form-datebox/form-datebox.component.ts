import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DxCalendarModule,
  DxDropDownButtonModule,
  DxDropDownButtonComponent,
  DxDateBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';

import { CommonModule } from '@angular/common';
import { ValidationRule } from 'devextreme/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'form-datebox',
  templateUrl: './form-datebox.component.html',
  styleUrl: '../form-textbox/form-textbox.component.scss',
  standalone: true,
  imports: [
    DxCalendarModule,
    DxDropDownButtonModule,
    DxDateBoxModule,
    CommonModule,
    DxValidatorModule,
    TranslateModule,
  ],
})
export class FormDateboxComponent {
  @ViewChild(DxDropDownButtonComponent)
  dropDownButtonComponent!: DxDropDownButtonComponent;

  @Input() isEditing = false;

  @Input() label = '';

  @Input() value!: string | Date | number;

  @Input() validators: ValidationRule[] = [];

  @Output() valueChange: EventEmitter<string | Date | number> =
    new EventEmitter();

  valueChanged(e: any) {
    this.valueChange.emit(e.value);
    this.dropDownButtonComponent?.instance?.close();
  }

  constructor() {}
}
