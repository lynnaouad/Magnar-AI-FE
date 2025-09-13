import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'apply',
  standalone: true 
})
export class ApplyPipe implements PipeTransform {
  transform(value: Object | ((...args: any[]) => any), arg1: any, ...args: any[]): any {
   return typeof value === 'function' ? value(arg1, ...args) : null;
  }
}
