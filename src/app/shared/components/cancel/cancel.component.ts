import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxiItemModule,
  DxoButtonOptionsModule,
} from 'devextreme-angular/ui/nested';
import { Location } from '@angular/common';
import { DxButtonModule, DxFormModule } from 'devextreme-angular';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'cancel',
  templateUrl: './cancel.component.html',
  styleUrl: './cancel.component.scss',
  standalone: true,
  imports: [
    DxButtonModule,
    TranslateModule,
    DxoButtonOptionsModule,
    DxiItemModule,
    DxFormModule,
  ],
})
export class CancelComponent implements OnInit, OnChanges {
  @Input() returnUrl: string | undefined;
  @Input() text: string = 'Cancel';
  @Input() readOnly: boolean = false;

  constructor(private location: Location, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {}

  cancel() {
    if (this.returnUrl == null) {
      this.location.back();
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }
}
