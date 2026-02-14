import type { Iquestion } from './sociograms';

export interface IstudentAnswer {
  id: number;
  value: string;
  sociogram_question_id: number;
  question?: Iquestion;
}
