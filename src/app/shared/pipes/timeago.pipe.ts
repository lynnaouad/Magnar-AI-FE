import { Pipe, PipeTransform } from '@angular/core';
import * as dateFns from 'date-fns';
import { ar } from 'date-fns/locale/ar';
import { enUS } from 'date-fns/locale/en-US';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date, language: string = 'en'): string {
    const date = new Date(value);
    const now = new Date();

    // Choose the locale based on the language
    const locale = language === 'ar' ? ar : enUS;

    // Format the distance with the selected locale
    return dateFns.formatDistance(date, now, {
      addSuffix: true,
      locale, // Use the selected locale
    });
  }
}