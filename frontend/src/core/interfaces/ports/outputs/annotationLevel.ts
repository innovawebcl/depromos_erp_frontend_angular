import { AnnotationLevel, IApiResponse } from "@core-interfaces/global";
import { Iinstitution } from "@core-ports/outputs/institution";


export interface IInstitutionAnnotationLevel {
    id: number;
    institution_id: number;
    annotation_level: AnnotationLevel;
    custom_label: string;
    institution: Iinstitution;
}
export type IinstitutionAnnotationLevelResponse = IApiResponse<IInstitutionAnnotationLevel>;
export type IinstitutionAnnotationLevelsResponse = IApiResponse<IInstitutionAnnotationLevel[]>;