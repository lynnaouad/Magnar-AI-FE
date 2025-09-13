import {
  Component,
  NgModule,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  output,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxListModule, DxListTypes } from 'devextreme-angular/ui/list';
import { IUser } from '../../services';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { DxScrollViewModule, DxSelectBoxModule } from 'devextreme-angular';

@Component({
  selector: 'user-menu-section',
  templateUrl: 'user-menu-section.component.html',
  styleUrls: ['./user-menu-section.component.scss'],
  standalone: true,
  imports: [
    DxListModule,
    CommonModule,
    TranslateModule,
    DxSelectBoxModule,
    DxScrollViewModule,
  ],
})
export class UserMenuSectionComponent implements OnChanges {
  @Input()
  menuItems: any;

  @Input()
  showAvatar!: boolean;

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

  @ViewChild('userInfoList', { read: ElementRef })
  userInfoList!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    protected languageService: LanguageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes != null && changes['imageUrl']) {
      this.imageUrl =
        this.imageUrl == null || this.imageUrl == ''
          ? '/user.png'
          : this.imageUrl;
    }
  }

  handleListItemClick(e: DxListTypes.ItemClickEvent) {
    e.itemData?.click();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  changeLanguage(e: any) {
    this.onChangeLanguage.emit(e.value);
  }
}
