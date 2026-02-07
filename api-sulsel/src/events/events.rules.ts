import { EventStatus, EventProgramType, TrainingEvent } from './events.types';

/**
 * 1️⃣ RULE: Validasi perubahan status event
 */
export function isValidStatusTransition(
  from: EventStatus,
  to: EventStatus,
): boolean {
  const allowed: Record<EventStatus, EventStatus[]> = {
    draft: ['published', 'cancelled'],
    published: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  return allowed[from].includes(to);
}

/**
 * 2️⃣ RULE: Konsistensi waktu event
 */
export function isValidEventDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

/**
 * 3️⃣ RULE: Apakah event masih boleh dimodifikasi
 * (misal: edit nama, tanggal, dsb)
 */
export function isEventMutable(status: EventStatus): boolean {
  return status === 'draft' || status === 'published';
}

/**
 * 4️⃣ RULE: Validasi kesesuaian tipe program
 * (dipakai lintas modul nanti)
 */
export function isValidProgramType(programType: EventProgramType): boolean {
  return ['ORIENTASI', 'KSR_DASAR', 'NON_KSR'].includes(programType);
}

/**
 * 5️⃣ RULE: Event boleh menerima pendaftaran peserta?
 */
export function canAcceptEnrollment(event: TrainingEvent): boolean {
  return event.status === 'published';
}
