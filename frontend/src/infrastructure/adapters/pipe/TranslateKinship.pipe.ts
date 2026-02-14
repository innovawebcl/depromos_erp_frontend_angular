import { Pipe, PipeTransform } from '@angular/core';
import { Kinship } from '@core-interfaces/global';

@Pipe({
  name: 'translateKinship',
  standalone: true,
})
export class TranslateKinshipPipe implements PipeTransform {
  private kinshipMap: Record<Kinship, string> = {
    [Kinship.Father]: 'Padre',
    [Kinship.Mother]: 'Madre',
    [Kinship.Grandparent]: 'Abuelo/Abuela',
    [Kinship.Uncle]: 'Tío',
    [Kinship.Aunt]: 'Tía',
    [Kinship.Other]: 'Otro',
  };

  transform(value: Kinship): string {
    return this.kinshipMap[value] || 'Desconocido';
  }
}
