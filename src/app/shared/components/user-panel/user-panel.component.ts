import {
  Component,
  NgModule,
  Input,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxListModule } from 'devextreme-angular/ui/list';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';
import { DxContextMenuModule } from 'devextreme-angular/ui/context-menu';
import { UserMenuSectionComponent } from '../user-menu-section/user-menu-section.component';
import { IUser } from '../../services';

@Component({
  selector: 'app-user-panel',
  templateUrl: 'user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  standalone: true,
  imports: [
    DxListModule,
    DxContextMenuModule,
    DxDropDownButtonModule,
    CommonModule,
    UserMenuSectionComponent,
  ],
})
export class UserPanelComponent implements OnChanges {
  @Input()
  menuItems: any[] = [];

  @Input()
  menuMode = 'context';

  @Input()
  languages: any[] = [];

  @Input()
  selectedLanguage: string = 'en';

  @Input()
  user: IUser = {
    userId: '',
    usernameOrEmail: '',
  };

  @Input() imageUrl: string = '';

  @Output() onChangeLanguage = new EventEmitter<string>();

  @ViewChild(UserMenuSectionComponent)
  userMenuSection!: UserMenuSectionComponent;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes != null && changes['imageUrl']) {
      this.imageUrl =
        this.imageUrl == null || this.imageUrl == ''
          ? '/user.png'
          : this.imageUrl;
    }
  }

  handleDropDownButtonContentReady({ component }: any) {
    component.registerKeyHandler('downArrow', () => {
      this.userMenuSection.userInfoList.nativeElement.focus();
    });
  }

  changeLanguage(e: any) {
    this.onChangeLanguage.emit(e);
  }
}
