import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'rut.js';

@Pipe({
  name: 'rutFormat',
  standalone: true,
  pure: true,
})
export class RutPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return format(value, { dots: false });
  }
}
