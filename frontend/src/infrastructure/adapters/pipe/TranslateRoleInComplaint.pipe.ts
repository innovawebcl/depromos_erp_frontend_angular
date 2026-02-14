import { Pipe, PipeTransform } from '@angular/core';
import { RoleInComplaint, RoleInComplaintFull } from '@core-interfaces/global';

@Pipe({
  name: 'translateRoleInComplaint',
  standalone: true,
})
export class TranslateRoleInComplaintPipe implements PipeTransform {
  private roleInComplaintMap: Record<RoleInComplaint, string> = {
    [RoleInComplaint.Witness]: 'Testigo',
    [RoleInComplaint.Victim]: 'Víctima',
  };

  transform(value: RoleInComplaint): string {
    return this.roleInComplaintMap[value] || 'Desconocido';
  }
}

@Pipe({
  name: 'translateRoleInComplaintFull',
  standalone: true,
})
export class TranslateRoleInComplaintFullPipe implements PipeTransform {
  private roleInComplaintMap: Record<RoleInComplaintFull, string> = {
    [RoleInComplaintFull.Witness]: 'Testigo',
    [RoleInComplaintFull.Victim]: 'Víctima',
    [RoleInComplaintFull.Accused]: 'Acusado',
    [RoleInComplaintFull.Accomplice]: 'Cómplice',
  };

  transform(value: RoleInComplaintFull): string {
    return this.roleInComplaintMap[value] || 'Desconocido';
  }
}
