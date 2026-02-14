import type { Iquestion } from './sociograms';

export interface IstudentAnswerClassmate {
  id: number;
  student_answer_id: number;
  student_id: number;
  sociogram_question_id: number;
  question?: Iquestion;
}
