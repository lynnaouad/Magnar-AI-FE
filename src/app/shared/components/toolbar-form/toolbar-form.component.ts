import {
  Component,
  Input,
  NgModule,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTooltipModule } from 'devextreme-angular';
import { LanguageService } from '../../services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { DxoButtonOptionsModule } from 'devextreme-angular/ui/nested';
import { RtlObserver } from '../../../Observables/RtlObserver.service';

@Component({
  selector: 'toolbar-form',
  templateUrl: './toolbar-form.component.html',
  styleUrls: ['./toolbar-form.component.scss'],
  standalone: true,
  imports: [
    DxToolbarModule,
    DxButtonModule,
    CommonModule,
    DxTooltipModule,
    TranslateModule,
    DxoButtonOptionsModule,
  ],
})
export class ToolbarFormComponent {
  @Input() editToolbar: boolean = false;

  @Input() addToolbar: boolean = false;

  @Input() isEditing: boolean = false;

  @Input() readOnly: boolean = false;

  @Input() title: string = '';

  @Output() addModeToggled = new EventEmitter();

  @Output() editModeToggled = new EventEmitter();

  @Output() saveButtonClicked = new EventEmitter();

  @Output() editingCancelled = new EventEmitter();

  constructor(
    protected languageService: LanguageService,
    private rtlObserver: RtlObserver
  ) {}

  handleCancelClick() {
    this.editingCancelled.emit();
  }

  handleEditClick() {
    this.editModeToggled.emit();
  }

  handleAddClick() {
    this.addModeToggled.emit();
  }

  handleSaveButtonClick(event: any) {
    this.saveButtonClicked.emit(event);
  }
}
