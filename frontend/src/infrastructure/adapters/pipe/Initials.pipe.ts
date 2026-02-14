import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    const words = value.trim().split(' ');
    const initials = words
      .filter((word) => word.length > 0)
      .map((word) => word[0].toUpperCase())
      .join('');

    return initials;
  }
}
