import { AnnotationLevel } from '@core-interfaces/global';

export interface IInstitutionAnnotationLevelInput {
  annotation_level: AnnotationLevel;
  custom_label: string;
}

export type AnnotationLevelArgs = 'annotation_level' | 'custom_label';
