import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import notify from 'devextreme/ui/notify';

@Injectable({ providedIn: 'root' })
export class ToastNotificationManager {
  constructor(private translateService: TranslateService) {}

  warning(
    messages: string | string[],
    stackOptions: any = {
      direction: 'down-stack',
      position: 'top right',
    },
    otherOptions: any = {
      closeOnClick: true,
      closeOnSwipe: false,
      displayTime: 5000,
      width: 400,
      height: 'auto',
    }
  ) {
    otherOptions.type = 'warning';

    if (Array.isArray(messages)) {
      messages.forEach((message) => {
        otherOptions.contentTemplate = () => {
          return this.getWarningMessageTemplate(message);
        };

        notify(otherOptions, stackOptions);
      });
    } else {
      otherOptions.contentTemplate = () => {
        return this.getWarningMessageTemplate(messages);
      };

      notify(otherOptions, stackOptions);
    }
  }

  getWarningMessageTemplate(message: string) {
    return `<div style="display: flex; align-items: flex-start; font-size: 16px;">
                <i class="dx-icon-warning" style="margin-right: 5px; color: orange; font-size: 23px;"></i>
                <span>${this.translateService.instant(message)}</span>
            </div>`;
  }

  success(
    messages: string | string[],
    stackOptions: any = {
      direction: 'down-stack',
      position: 'top right',
    },
    otherOptions: any = {
      closeOnClick: true,
      closeOnSwipe: false,
      displayTime: 5000,
      width: 'auto',
      height: 'auto',
    }
  ) {
    otherOptions.type = 'success';
    if (Array.isArray(messages)) {
      messages.forEach((message) => {
        otherOptions.contentTemplate = () => {
          return this.getSuccessMessageTemplate(message);
        };
        notify(otherOptions, stackOptions);
      });
    } else {
      otherOptions.contentTemplate = () => {
        return this.getSuccessMessageTemplate(messages);
      };
      notify(otherOptions, stackOptions);
    }
  }

  getSuccessMessageTemplate(message: string) {
    return `<div style="display: flex; align-items: flex-start; font-size: 16px;">
                <i class="dx-icon-check" style="margin-right: 5px; color: #3BDB6C; font-size: 23px;"></i>
                <span>${this.translateService.instant(message)}</span>
            </div>`;
  }

  error(
    messages: string | string[],
    stackOptions: any = {
      direction: 'down-stack',
      position: 'top right',
    },
    otherOptions: any = {
      closeOnClick: true,
      closeOnSwipe: false,
      displayTime: 5000,
      width: 'auto',
      height: 'auto',
    }
  ) {
    otherOptions.type = 'error';
    if (Array.isArray(messages)) {
      messages.forEach((message) => {
        otherOptions.contentTemplate = () => {
          return this.getErrorMessageTemplate(message);
        };
        notify(otherOptions, stackOptions);
      });
    } else {
      otherOptions.contentTemplate = () => {
        return this.getErrorMessageTemplate(messages);
      };
      notify(otherOptions, stackOptions);
    }
  }

  getErrorMessageTemplate(message: string) {
    return `<div style="display: flex; align-items: flex-start; font-size: 16px;">
                <i class="dx-icon-clearcircle" style="margin-right: 5px; color: #fff; font-size: 23px;"></i>
                <span>${this.translateService.instant(message)}</span>
            </div>`;
  }

  info(
    messages: string | string[],
    stackOptions: any = {
      direction: 'down-stack',
      position: 'top right',
    },
    otherOptions: any = {
      closeOnClick: true,
      closeOnSwipe: false,
      displayTime: 5000,
      width: 'auto',
      height: 'auto',
    }
  ) {
    otherOptions.type = 'info';
    if (Array.isArray(messages)) {
      messages.forEach((message) => {
        otherOptions.contentTemplate = () => {
          return this.getInfoMessageTemplate(message);
        };

        notify(otherOptions, stackOptions);
      });
    } else {
      otherOptions.contentTemplate = () => {
        return this.getInfoMessageTemplate(messages);
      };

      notify(otherOptions, stackOptions);
    }
  }

  getInfoMessageTemplate(message: string) {
    return `<div style="display: flex; align-items: flex-start; font-size: 16px;">
                <i class="dx-icon-info" style="margin-right: 5px; color: #5499c7; font-size: 23px;"></i>
                <span>${this.translateService.instant(message)}</span>
            </div>`;
  }

  notify(options: any, type?: string, displayTime?: number): void {
    notify(options, type, displayTime);
  }
}
