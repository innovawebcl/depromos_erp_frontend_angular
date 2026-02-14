import { ComplaintArgs, IcomplaintInput } from "@core-ports/inputs/complaint";  
import { IcomplaintResponse, IcomplaintsResponse } from "@core-ports/outputs/complaint";
import { FormControl } from "@angular/forms";
import { ErrorMessage, BoolOrNull, DateOrNull, StringOrNull, IDroppedFile } from "@core-interfaces/global";  
import { Observable } from "rxjs";


export interface IcomplaintFormInput extends Omit<IcomplaintInput, ComplaintArgs> {
    description: FormControl<StringOrNull>;
    where_description: FormControl<StringOrNull>;
    with_description: FormControl<StringOrNull>;
    alone: FormControl<BoolOrNull>;
    date_event: FormControl<DateOrNull>;
    role_in_complaint: FormControl<StringOrNull>;
}


export interface IcomplaintService {
    /**
   * * Define la estructura de errores para la interpretación del formulario en pantalla
   */
  readonly errorMessages: ErrorMessage;

  /**
   * Obtener todas las denuncias
   */
  getAllComplaints(): Promise<Observable<IcomplaintsResponse>>;

  /**
   * * Solicitud para crear una nueva denuncia, es requerido rol estudiante o profesor
   */
  storeComplaint(
    input: IcomplaintInput,
    files: IDroppedFile[]
  ): Promise<Observable<IcomplaintResponse>>;
}