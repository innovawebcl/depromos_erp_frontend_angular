import { Pipe, PipeTransform } from '@angular/core';
import { InvestigationState } from '@core-interfaces/global';


@Pipe({
  name: 'translateInvestigationState',
  standalone: true,
})
export class TranslateInvestigationStatePipe implements PipeTransform {
  private investigationStateMap: Record<InvestigationState, string> = {
    [InvestigationState.Init]: 'Iniciada',
    [InvestigationState.Advanced]: 'Avanzada',
    [InvestigationState.Finalized]: 'Finalizada',
  };

  transform(value: InvestigationState): string {
    return this.investigationStateMap[value] || 'Desconocido';
  }
}
