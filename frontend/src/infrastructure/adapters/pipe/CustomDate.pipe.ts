import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
@Pipe({
    name: 'customDate',
    standalone: true,
  })
  export class CustomDatePipe implements PipeTransform {
    transform(value: string | Date, format: string): string {
        if (!value) return '';
    
        const date = dayjs(value).locale('es');
    
        switch (format) {
          case 'DD-MMM-YYYY':
            return date.format('D MMM YYYY');
          case 'DD-MM-YYYY':
            return date.format('DD-MM-YYYY');
          case 'DD de MMMM':
            return date.format('D [de] MMMM');
          case 'DD de MMMM de YYYY':
            return date.format('D [de] MMMM [de] YYYY');
          case 'MMMM YYYY':
            return date.format('MMMM YYYY').replace(/^\w/, (c) => c.toUpperCase());
          case 'MMM YYYY':
            return date.format('MMM YYYY').toUpperCase();
        case 'DD de MMMM YYYY. HH:mm':
            return date.format('D [de] MMMM YYYY. HH:mm [hrs.]');
          default:
            return date.format();
        }
      }
  }
  