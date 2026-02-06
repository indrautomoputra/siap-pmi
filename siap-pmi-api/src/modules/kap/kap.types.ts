import { EventId } from '../events/events.types';

export type KapInstrumentId = string;
export type KapQuestionId = string;
export type KapResponseId = string;

export type KapQuestionType = 'likert' | 'boolean' | 'text';

export interface KapInstrument {
  id: KapInstrumentId;
  eventId: EventId;
  title: string;
  isActive: boolean;
  createdAt: Date;
}

export interface KapQuestion {
  id: KapQuestionId;
  instrumentId: KapInstrumentId;
  questionText: string;
  questionType: KapQuestionType;
  scaleMin?: number;
  scaleMax?: number;
  orderNo: number;
}

export interface KapResponse {
  id: KapResponseId;
  instrumentId: KapInstrumentId;
  enrollmentHash: string;
  answers: Record<string, unknown>;
  submittedAt: Date;
}
