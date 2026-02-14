import { Pipe, PipeTransform } from '@angular/core';
import { AnnotationLevel } from '@core-interfaces/global';

@Pipe({
  name: 'translateAnnotation',
  standalone: true,
})
export class TranslateAnnotationLevelPipe implements PipeTransform {
  private annotationLevelMap: Record<AnnotationLevel, string> = {
    [AnnotationLevel.Remedial]: 'Remedial',
    [AnnotationLevel.Positive]: 'Positiva',
    [AnnotationLevel.Low]: 'Leve',
    [AnnotationLevel.Severe]: 'Grave',
    [AnnotationLevel.VerySevere]: 'Gravísima',
    [AnnotationLevel.RemedialGeneral]: 'Remedial General',
    [AnnotationLevel.PositiveGeneral]: 'General Positiva',
    [AnnotationLevel.NegativeGeneral]: 'General Negativa',
  };

  transform(value: AnnotationLevel): string {
    return this.annotationLevelMap[value] || 'Desconocido';
  }
}
