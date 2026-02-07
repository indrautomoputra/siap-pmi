export type ReportsSummaryResponse = {
  eventId: string;
  totalEnrollments: number;
  totalParticipants: number;
  totalTrainers: number;
  totalObservers: number;
  totalEvaluationsSubmitted: number;
  totalAssessedParticipants: number;
  evaluationSubmissionRate: number;
  assessmentCoverageRate: number;
};

export type ReportsParticipantItem = {
  enrollmentId: string;
  participantName?: string;
  roleInEvent: 'PESERTA';
  hasEvaluation: boolean;
  hasAssessment: boolean;
  lastAssessmentAt?: string;
};

export type ReportsParticipantsResponse = {
  eventId: string;
  participants: ReportsParticipantItem[];
};
