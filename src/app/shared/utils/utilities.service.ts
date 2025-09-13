import { Injectable } from '@angular/core';
import { Observable, ObservableInput, take, throwError } from 'rxjs';
import { ToastNotificationManager } from './toast-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../services/language.service';

@Injectable({ providedIn: 'root' })
export class Utilities {
  constructor(
    private toastNotificationManager: ToastNotificationManager,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  public FormatDateOnly(date: string | Date, locale = 'en-CA'): string | null {
    if (date == null) {
      return null;
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }

    return date.toLocaleDateString(locale);
  }

  public getMonthsList(): any[] {
    let monthsList: any[] = [];
    let translationKey = `months.${this.languageService.getLocale()}.`;

    for (let i = 1; i <= 12; i++) {
      this.translate
        .get(translationKey + i)
        .subscribe((translatedMonth: string) => {
          monthsList.push({ id: i, value: translatedMonth });
        });
    }

    return monthsList;
  }

  public getMonthNameById(id: any): string | undefined {
    const months = this.getMonthsList();
    const month = months.find((m) => m.id === id);
    return month ? month.value : undefined;
  }

  public getYearsList(startYear: number = 0, endYear: number = 0): any[] {
    const years = [];

    if (startYear == 0) {
      startYear = 1920;
    }

    if (endYear == 0) {
      endYear = new Date().getFullYear() + 10;
    }

    for (let year = startYear; year <= endYear; year++) {
      // Convert the year to Arabic numerals if the language is Arabic
      const yearValue =
        this.translate.currentLang === 'ar'
          ? this.toArabicNumerals(year)
          : year.toString();
      years.push({ id: year, value: yearValue });
    }

    return years.sort((a: any, b: any) => b.id - a.id);
  }

  public getYearById(id: any): string | undefined {
    const years = this.getYearsList();
    const year = years.find((y) => y.id === id);
    return year ? year.value : undefined;
  }

  public toUtcFormat(date: Date | string): string {
    // Ensure input is a Date object
    const localDate = new Date(date);

    if (isNaN(localDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  public resetFormData(form: any) {
    form?.instance?.reset();
    form?.instance?.resetValues();
  }

  public validateDates(
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number
  ) {
    if (startMonth && startYear && endMonth && endYear) {
      const startDate = new Date(startYear, startMonth - 1);
      const endDate = new Date(endYear, endMonth - 1);

      if (endDate < startDate) {
        return false;
      }
    }

    return true;
  }

  public handleErrorGlobal = (
    err: any,
    caught: Observable<Object>
  ): ObservableInput<any> => {
    try {
      const errorsList: any[] = [];
      const errors = err.error.errors ? err.error.errors : err.error;

      for (const [_, value] of Object.entries(errors)) {
        const error: any = value;
        if (error.message != null) {
          errorsList.push(error.message);
        } else {
          errorsList.push(...(<any[]>value));
        }
      }

      if (this.toastNotificationManager) {
        this.toastNotificationManager.warning(errorsList);
      } else {
        console.error('toastNotificationManager is undefined');
      }
    } catch {
      if (this.toastNotificationManager) {
        this.toastNotificationManager.error('ToastNotifications.ErrorOccured');
      } else {
        console.error('toastNotificationManager is undefined');
      }
    } finally {
      return throwError(() => err);
    }
  };

  public toArabicNumerals(number: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number
      .toString()
      .split('')
      .map((digit) => arabicNumerals[parseInt(digit)])
      .join('');
  }

  public translateNumber(number: number) {
    let currentLang = this.languageService.getCurrentLanguage();
    if (currentLang == 'ar') {
      return this.toArabicNumerals(number);
    }

    return number;
  }

  public resetFileUploader(fileUploader: any) {
    if (fileUploader) {
      fileUploader.instance.reset();
    }
  }

  public resizeByteArrayImage(
    byteArray: Uint8Array,
    maxWidth: number,
    maxHeight: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Convert byte array to Blob
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Read Blob as Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          // Resize image using canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to base64
            const resizedBase64 = canvas.toDataURL('image/png');
            resolve(resizedBase64);
          } else {
            reject('Canvas not supported');
          }
        };

        img.onerror = reject;
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  public resizeBase64Image(
    base64: string,
    maxWidth: number,
    maxHeight: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Resize image using canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert resized image to base64
          const resizedBase64 = canvas.toDataURL('image/png');
          resolve(resizedBase64);
        } else {
          reject('Canvas not supported');
        }
      };

      img.onerror = reject;
    });
  }

  // Convert Blob to Base64
  public blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  async fetchImage(imagePath: string): Promise<Blob> {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    return blob;
  }

  async getImageFile(imagePath: string): Promise<File | null> {
    try {
      // Fetch the image as a Blob
      const blob = await this.fetchImage(imagePath);

      // Extract filename from path (e.g., "image1.png")
      const fileName = imagePath.split('/').pop() || 'image.png';

      // Convert Blob to File
      const file = new File([blob], fileName, { type: blob.type });

      return file;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  }
}
