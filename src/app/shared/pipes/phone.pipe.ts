import { Pipe, PipeTransform } from '@angular/core';

export function formatPhone(value: string) {
  return String(value).replace(/(\d{3})(\d{3})(\d{4})/, '+1($1)$2-$3');
}

@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(value: string): any {
   return formatPhone(value);
  }
}