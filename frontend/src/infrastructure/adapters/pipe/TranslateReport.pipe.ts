import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translateReport',
  standalone: true,
})
export class TranslateReportPipe implements PipeTransform {
  //  TODO fix match de translate neutral = 'Indiferente',
  private ReportOptions: Record<string, string> = {
    uncomfortable: 'Incómodo/a',
    slightly_comfortable: 'Poco cómodo/a',
    very_comfortable: 'Muy cómodo/a',
    extremely_comfortable: 'Extremadamente cómodo/a',
    personal: 'Personalmente',
    phone: 'Llamarle por teléfono',
    social_media: 'Por redes sociales',
    online_games: 'Juegos en línea',
    yes: 'Sí',
    no: 'No',
    not_sure: 'No sabría decirlo',
    ignore: 'Los ignoro',
    seek_help: 'Pido ayuda',
    respond_similarly: 'Respondiendo de la misma manera',
    dialogue: 'Dialogando',
    none: 'Nada',
    a_bit: 'Un poco',
    neutral: 'Neutral',
    quite_a_bit: 'Bastante',
    a_great_deal: 'Muchísimo',
    very_bad: 'Nada de bien',
    a_bit_bad: 'Un poco bien',
    indifferent: 'Indiferente',
    very_good: 'Muy bien',
    extremely_good: 'Extremadamente bien',
    resources_and_infrastructure: 'Recursos e infraestructura',
    classmates: 'Compañeros/as',
    classes: 'Las clases',
    teachers: 'Profesores/as',
    less_than_5: 'Menos de 5',
    between_6_and_7: 'Entre 6 y 7',
    more_than_8: 'Más de 8',
    activities: 'Realizo actividades para distraerme',
    no_control: 'No lo puedo controlar',
    no_stress: 'No me estreso',
  };

  transform(value: string): string {
    return this.ReportOptions[value] || 'Desconocido';
  }
}
