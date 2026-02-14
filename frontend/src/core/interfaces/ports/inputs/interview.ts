


export interface IInterviewInput {
    interview_date: Date;
    reason: string;
    records: string;
    comments: string;
    agreements: string;
}

export type InterviewArgs = keyof IInterviewInput;