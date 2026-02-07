import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  EnrollmentReviewStatus,
  EnrollmentStatus,
  PMIElement,
} from '../../modules/enrollments/enrollments.types';
import type { EventRoleType } from '../../modules/event-roles/event-roles.types';
import type {
  EventProgramType,
  EventStatus,
} from '../../modules/events/events.types';

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

const getSupabaseEnv = (): SupabaseEnv => {
  const url = process.env.SUPABASE_URL ?? '';
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLIC_KEY ?? '';
  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
  }
  return { url, anonKey };
};

type EventsRow = {
  id: string;
  name: string;
  program_type: EventProgramType;
  status: EventStatus;
  start_date: string;
  end_date: string;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type EnrollmentsRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  participant_name: string;
  display_name: string | null;
  pmi_element: PMIElement | null;
  status: EnrollmentStatus;
  review_status: EnrollmentReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  registered_at: string;
  created_by: string | null;
};

type EventRoleAssignmentsRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  role: EventRoleType;
  person_name: string;
  display_name: string | null;
  assigned_at: string;
  created_by: string | null;
};

type EnrollmentDocumentsRow = {
  id: string;
  enrollment_id: string;
  doc_type: string;
  file_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

type EnrollmentKsrBasicDetailsRow = {
  enrollment_id: string;
  nik: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  phone_number: string;
  email: string;
  education: string;
  occupation: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

type EnrollmentGeneralDetailsRow = {
  enrollment_id: string;
  unsur_pmi: PMIElement;
  nik: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  phone_number: string;
  email: string;
  education: string;
  occupation: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  organization_name: string | null;
  organization_role: string | null;
};

type AssessmentInstrumentsRow = {
  id: string;
  event_id: string;
  kind: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

type AssessmentCriteriaRow = {
  id: string;
  instrument_id: string;
  criterion: string;
  weight: number | null;
  order_no: number;
};

type AssessmentScoresRow = {
  id: string;
  instrument_id: string;
  enrollment_id: string;
  scored_by: string;
  scores: Record<string, unknown>;
  submitted_at: string;
};

type EvaluationsRow = {
  id: string;
  event_id: string;
  enrollment_id: string;
  responses: Record<string, unknown>;
  submitted_at: string;
};

type KapInstrumentsRow = {
  id: string;
  event_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
};

type KapQuestionsRow = {
  id: string;
  instrument_id: string;
  question_text: string;
  question_type: string;
  scale_min: number | null;
  scale_max: number | null;
  order_no: number;
};

type KapResponsesRow = {
  id: string;
  instrument_id: string;
  enrollment_hash: string;
  answers: Record<string, unknown>;
  submitted_at: string;
};

type GraduationDecisionsRow = {
  id: string;
  event_id: string;
  enrollment_id: string;
  decision: string;
  decided_by: string;
  decided_at: string;
  note: string | null;
};

type AuditLogsRow = {
  id: string;
  event_id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type AuthUsersRow = {
  id: string;
  email: string | null;
  created_at: string;
  banned_until: string | null;
};

type Database = {
  public: {
    Tables: {
      events: {
        Row: EventsRow;
        Insert: EventsRow;
        Update: Partial<EventsRow>;
        Relationships: Relationship[];
      };
      enrollments: {
        Row: EnrollmentsRow;
        Insert: {
          id: string;
          event_id: string;
          user_id?: string | null;
          participant_name: string;
          display_name?: string | null;
          pmi_element?: PMIElement | null;
          status: EnrollmentStatus;
          review_status: EnrollmentReviewStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
          registered_at: string;
          created_by?: string | null;
        };
        Update: Partial<EnrollmentsRow>;
        Relationships: Relationship[];
      };
      event_role_assignments: {
        Row: EventRoleAssignmentsRow;
        Insert: {
          id: string;
          event_id: string;
          user_id?: string | null;
          role: EventRoleType;
          person_name: string;
          display_name?: string | null;
          assigned_at: string;
          created_by?: string | null;
        };
        Update: Partial<EventRoleAssignmentsRow>;
        Relationships: Relationship[];
      };
      enrollment_documents: {
        Row: EnrollmentDocumentsRow;
        Insert: {
          id?: string;
          enrollment_id: string;
          doc_type: string;
          file_path: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: Partial<EnrollmentDocumentsRow>;
        Relationships: Relationship[];
      };
      enrollment_ksr_basic_details: {
        Row: EnrollmentKsrBasicDetailsRow;
        Insert: EnrollmentKsrBasicDetailsRow;
        Update: Partial<EnrollmentKsrBasicDetailsRow>;
        Relationships: Relationship[];
      };
      enrollment_general_details: {
        Row: EnrollmentGeneralDetailsRow;
        Insert: EnrollmentGeneralDetailsRow;
        Update: Partial<EnrollmentGeneralDetailsRow>;
        Relationships: Relationship[];
      };
      assessment_instruments: {
        Row: AssessmentInstrumentsRow;
        Insert: AssessmentInstrumentsRow;
        Update: Partial<AssessmentInstrumentsRow>;
        Relationships: Relationship[];
      };
      assessment_criteria: {
        Row: AssessmentCriteriaRow;
        Insert: AssessmentCriteriaRow;
        Update: Partial<AssessmentCriteriaRow>;
        Relationships: Relationship[];
      };
      assessment_scores: {
        Row: AssessmentScoresRow;
        Insert: AssessmentScoresRow;
        Update: Partial<AssessmentScoresRow>;
        Relationships: Relationship[];
      };
      evaluations: {
        Row: EvaluationsRow;
        Insert: EvaluationsRow;
        Update: Partial<EvaluationsRow>;
        Relationships: Relationship[];
      };
      kap_instruments: {
        Row: KapInstrumentsRow;
        Insert: KapInstrumentsRow;
        Update: Partial<KapInstrumentsRow>;
        Relationships: Relationship[];
      };
      kap_questions: {
        Row: KapQuestionsRow;
        Insert: KapQuestionsRow;
        Update: Partial<KapQuestionsRow>;
        Relationships: Relationship[];
      };
      kap_responses: {
        Row: KapResponsesRow;
        Insert: KapResponsesRow;
        Update: Partial<KapResponsesRow>;
        Relationships: Relationship[];
      };
      graduation_decisions: {
        Row: GraduationDecisionsRow;
        Insert: GraduationDecisionsRow;
        Update: Partial<GraduationDecisionsRow>;
        Relationships: Relationship[];
      };
      audit_logs: {
        Row: AuditLogsRow;
        Insert: {
          id?: string;
          event_id: string;
          actor_user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<AuditLogsRow>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_program_type: EventProgramType;
      event_status: EventStatus;
      enrollment_status: EnrollmentStatus;
      enrollment_review_status: EnrollmentReviewStatus;
      pmi_element: PMIElement;
      event_role_type: EventRoleType;
    };
    CompositeTypes: Record<string, never>;
  };
  auth: {
    Tables: {
      users: {
        Row: AuthUsersRow;
        Insert: Partial<AuthUsersRow>;
        Update: Partial<AuthUsersRow>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SupabaseClientType = SupabaseClient<Database>;

export const createSupabaseClient = (options?: {
  jwt?: string;
}): SupabaseClientType => {
  const { url, anonKey } = getSupabaseEnv();
  const headers = options?.jwt
    ? { Authorization: `Bearer ${options.jwt}` }
    : undefined;
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: headers ? { headers } : undefined,
  });
};
