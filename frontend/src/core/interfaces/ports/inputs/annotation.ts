import { AnnotationLevel } from '@core-interfaces/global';

export interface IannotationInput {
  type: AnnotationLevel;
  observation: string;
}

export type AnnotationArgs = 'type' | 'observation';
