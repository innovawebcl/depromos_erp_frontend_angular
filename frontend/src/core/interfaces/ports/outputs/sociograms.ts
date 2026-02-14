import type { IApiResponse, Ioption } from '@core-interfaces/global';
import type { Icourse } from './course';
import type { Iinstitution } from './institution';
import { IstudentResponse } from '@core-ports/outputs/student';
import { IstudentAnswerClassmate } from '@core-ports/outputs/studentAnswerClassmate';
import { IstudentAnswer } from '@core-ports/outputs/studentAnswer';

export interface Iquestion {
  id: number;
  title: string;
  is_multiple_choice: boolean;
  rules: string;
  enum_as_options: string;
  answers?: Ioption[]; // TODO validar
}

export interface Isociogram {
  id: number;
  active: boolean;
  title: string;
  version: number;
  questions: Iquestion[];
  student_responses?: IstudentAnswer[];
  student_classmate_responses?: IstudentAnswerClassmate[];
}

export interface IanswerTypes {
  ComfortLevel: Ioption[];
  SatisfactionLevel: Ioption[];
  ConfirmationResponse: Ioption[];
  BinaryConfirmationResponse: Ioption[];
  ConflictResolution: Ioption[];
  EmpathyLevel: Ioption[];
  SchoolPreference: Ioption[];
  SleepHours: Ioption[];
  StressManagement: Ioption[];
  CommunicationMethod: Ioption[];
  StudentsClassmate: Ioption[];
}

export interface IcoursesToSociogram {
  id: number;
  title: string;
  active: boolean;
  courses: Omit<
    Icourse,
    'institution_id' | 'institution' | 'created_at' | 'updated_at'
  >[];
}
// TODO refactor interfaces

export interface IinstitutionsToSociogram {
  id: number;
  title: string;
  active: boolean;
  institutions: Iinstitution[];
}

// TODO Refactor interfaz
export interface IreportSociogram {
  report_description: string;
  institution: string;
  course: string;
  teacher: string;
  date: string;
  simple_metrics_graph: {
    question_id: number;
    question: string;
    answers: any; // TODO mapping de enum
  }[];
  feeling_towards_the_institution: {
    description: string;
    answers_graph: {
      question_id: number;
      question: string;
      answers: {
        teachers: string;
        classmates: string;
        resources_and_infrastructure: string;
        classes: string;
      };
    }[];
  };
  communication_preferences: string;
  nodes_and_links_for_sociograms: {
    nodes: {
      id: string;
      label: string;
    }[];
    links: {
      id: string;
      source: string;
      target: string;
      line_type: string; // unidireccional - bidireccional - segemendata
    }[];
  };
  positive_leaders: {
    student_id: number;
    count: number;
    percentage: number;
    name: string;
  }[];
  negative_leaders: {
    student_id: number;
    count: number;
    percentage: number;
    name: string;
  }[];
  nodes_and_links_for_working_group_sociogram: {
    nodes: {
      id: string;
      label: string;
    }[];
    links: {
      id: string;
      source: string;
      target: string;
      line_type: string; // unidireccional - bidireccional - segemendata
    }[];
  };
  student_who_percive_lonely: {
    question_id: number;
    value: string;
    student: string;
  }[];
  student_are_single_out_by_their_peers_lonely: {
    student_id: number;
    count: number;
    percentage: number;
    name: string;
  }[];
  self_care: {
    mental_health: {
      question_id: number;
      question: string;
      answers: any; // TODO mapping de enum
    }[];
    nutrition: {
      question_id: number;
      question: string;
      answers: any; // TODO mapping de enum
    }[];
    sleep: {
      question_id: number;
      question: string;
      answers: any; // TODO mapping de enum
    }[];
  };
  bullying: {
    question_id: number;
    question: string;
    answers: any; // TODO mapping de enum
  }[];
  recommendations: {
    empathy: string;
    pei: string;
    family_and_institution: string;
    physical_activity: string;
    nutritional_habits: string;
    control_stress: string;
  };
}

export type IsociogramResponses = IApiResponse<Isociogram[]>;
export type IsociogramAnswerResponses = IApiResponse<IanswerTypes>;
export type IsociogramRulesResponses = IApiResponse<Ioption[]>;
export type IsociogramOptionsResponses = IApiResponse<Ioption[]>;
export type IclassmateOptionsResponses = IApiResponse<Ioption[]>;
export type IanswerBySociogramResponses = IApiResponse<
  {
    question_id: number;
    value: string | number | string[] | number[];
  }[]
>;
export type IsociogramResponse = IApiResponse<Isociogram>;
export type IcoursesToSociogramResponse = IApiResponse<IcoursesToSociogram>;
export type IreportSociogramResponse = IApiResponse<IreportSociogram>;

export type IinstitutionsToSociogramResponse =
  IApiResponse<IinstitutionsToSociogram>;
