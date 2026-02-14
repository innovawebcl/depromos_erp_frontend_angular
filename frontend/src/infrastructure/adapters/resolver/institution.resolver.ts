import { Injectable } from "@angular/core";
import { InstitutionManager } from "@infra-adapters/services/institution.service";
import { Observable } from "rxjs";
@Injectable({ providedIn: 'root' })
export class InstitutionResolver {
    constructor(private institutionService: InstitutionManager) {}

    resolve(): Observable<any> {
        return new Observable((observer) => {
            this.institutionService.loadInstitutions().then((observable) => {
              observable.subscribe({
                next: (data) => {
                  observer.next(data.data);
                  observer.complete();
                },
                error: (error) => observer.error(error),
              });
            });
          });
    }
}