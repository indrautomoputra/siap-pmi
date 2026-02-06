import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import {
  KapInstrument,
  KapQuestion,
  KapResponse,
  KapQuestionType,
} from './kap.types';

type KapInstrumentRow = {
  id: string;
  event_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

type KapQuestionRow = {
  id: string;
  instrument_id: string;
  question_text: string;
  question_type: KapQuestionType;
  scale_min: number | null;
  scale_max: number | null;
  order_no: number;
};

type KapResponseRow = {
  id: string;
  instrument_id: string;
  enrollment_hash: string;
  answers: Record<string, unknown>;
  submitted_at: string;
};

const toDomainInstrument = (row: KapInstrumentRow): KapInstrument => ({
  id: row.id,
  eventId: row.event_id,
  title: row.title,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
});

const toDomainQuestion = (row: KapQuestionRow): KapQuestion => ({
  id: row.id,
  instrumentId: row.instrument_id,
  questionText: row.question_text,
  questionType: row.question_type,
  scaleMin: row.scale_min ?? undefined,
  scaleMax: row.scale_max ?? undefined,
  orderNo: row.order_no,
});

const toDomainResponse = (row: KapResponseRow): KapResponse => ({
  id: row.id,
  instrumentId: row.instrument_id,
  enrollmentHash: row.enrollment_hash,
  answers: row.answers ?? {},
  submittedAt: new Date(row.submitted_at),
});

@Injectable()
export class KapRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createInstrument(instrument: KapInstrument): Promise<KapInstrument> {
    const client = this.supabaseProvider.getClient();
    const payload: KapInstrumentRow = {
      id: instrument.id,
      event_id: instrument.eventId,
      title: instrument.title,
      is_active: instrument.isActive,
      created_at: instrument.createdAt.toISOString(),
    };
    const { data, error } = await client
      .from('kap_instruments')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create KAP instrument');
    }
    return toDomainInstrument(data as KapInstrumentRow);
  }

  async findInstrumentById(
    instrumentId: string,
  ): Promise<KapInstrument | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('kap_instruments')
      .select('*')
      .eq('id', instrumentId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return toDomainInstrument(data as KapInstrumentRow);
  }

  async addQuestion(question: KapQuestion): Promise<KapQuestion> {
    const client = this.supabaseProvider.getClient();
    const payload: KapQuestionRow = {
      id: question.id,
      instrument_id: question.instrumentId,
      question_text: question.questionText,
      question_type: question.questionType,
      scale_min: question.scaleMin ?? null,
      scale_max: question.scaleMax ?? null,
      order_no: question.orderNo,
    };
    const { data, error } = await client
      .from('kap_questions')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to add KAP question');
    }
    return toDomainQuestion(data as KapQuestionRow);
  }

  async findResponseByInstrumentAndHash(
    instrumentId: string,
    enrollmentHash: string,
  ): Promise<KapResponse | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('kap_responses')
      .select('*')
      .eq('instrument_id', instrumentId)
      .eq('enrollment_hash', enrollmentHash)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return toDomainResponse(data as KapResponseRow);
  }

  async createResponse(response: KapResponse): Promise<KapResponse> {
    const client = this.supabaseProvider.getClient();
    const payload: KapResponseRow = {
      id: response.id,
      instrument_id: response.instrumentId,
      enrollment_hash: response.enrollmentHash,
      answers: response.answers,
      submitted_at: response.submittedAt.toISOString(),
    };
    const { data, error } = await client
      .from('kap_responses')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create KAP response');
    }
    return toDomainResponse(data as KapResponseRow);
  }
}
