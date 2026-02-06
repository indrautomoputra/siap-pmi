import { EnrollmentsService } from './enrollments.service';
import { EnrollmentDocumentsService } from './enrollment-documents.service';
import { EnrollmentPolicy } from './enrollments.policy';
import { EnrollmentsRepository } from './enrollments.repository';
import { EventPolicy } from '../events/events.policy';
import { EventsService } from '../events/events.service';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { CreateKsrBasicEnrollmentDto } from './create-ksr-basic-enrollment.dto';
import { CreateGeneralEnrollmentDto } from './create-general-enrollment.dto';
import { EnrollmentApprovalPolicy } from './enrollment-approval.policy';

describe('Enrollments v1 feature', () => {
  it('creates KSR basic enrollment and detail', async () => {
    const request = { user: { id: 'user-1' }, headers: {} };
    const createKsrBasicDetail = jest.fn().mockResolvedValue(undefined);
    const enrollmentsRepository = {
      createEnrollment: jest.fn().mockResolvedValue({
        id: 'enroll-1',
        eventId: 'event-1',
        userId: 'user-1',
        participantName: 'Budi',
        status: 'registered',
        reviewStatus: 'pending_review',
        registeredAt: new Date(),
      }),
      createKsrBasicDetail,
    } as unknown as EnrollmentsRepository;
    const eventPolicy = {
      assertEventExists: jest.fn().mockResolvedValue(undefined),
    } as unknown as EventPolicy;
    const enrollmentPolicy = {
      assertEventOpenForEnrollment: jest.fn(),
      assertNotAlreadyEnrolled: jest.fn().mockResolvedValue(undefined),
    } as unknown as EnrollmentPolicy;
    const enrollmentApprovalPolicy = {} as EnrollmentApprovalPolicy;
    const eventAuthorizationPolicy = {} as EventAuthorizationPolicy;
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const rateLimitService = { consume: jest.fn() };
    const idempotencyService = {
      normalizeKey: jest.fn().mockReturnValue(null),
      get: jest.fn(),
      set: jest.fn(),
    };
    const eventsService = {
      findEventById: jest.fn().mockResolvedValue({
        id: 'event-1',
        name: 'Event A',
        programType: 'KSR_DASAR',
        status: 'published',
        startDate: new Date(),
        endDate: new Date(),
      }),
    } as unknown as EventsService;
    const authService = {
      extractBearerToken: jest.fn().mockReturnValue(null),
    } as unknown as AuthService;
    const service = new EnrollmentsService(
      request as never,
      enrollmentsRepository,
      eventPolicy,
      enrollmentPolicy,
      enrollmentApprovalPolicy,
      eventAuthorizationPolicy,
      eventsService,
      authService,
      auditService as never,
      rateLimitService as never,
      idempotencyService as never,
    );
    const dto: CreateKsrBasicEnrollmentDto = {
      participantName: 'Budi',
      nik: '1234567890123456',
      birthPlace: 'Bandung',
      birthDate: '2000-01-01',
      gender: 'L',
      address: 'Jl. Mawar',
      phoneNumber: '08123456789',
      email: 'budi@example.com',
      education: 'SMA',
      occupation: 'Mahasiswa',
      bloodType: 'O',
      emergencyContactName: 'Sari',
      emergencyContactPhone: '08123456788',
    };

    const result = await service.createKsrBasic('event-1', dto);

    expect(result.enrollmentId).toBe('enroll-1');
    expect(createKsrBasicDetail).toHaveBeenCalledTimes(1);
  });

  it('creates general enrollment and detail', async () => {
    const request = { user: { id: 'user-2' }, headers: {} };
    const createGeneralDetail = jest.fn().mockResolvedValue(undefined);
    const enrollmentsRepository = {
      createEnrollment: jest.fn().mockResolvedValue({
        id: 'enroll-2',
        eventId: 'event-2',
        userId: 'user-2',
        participantName: 'Sari',
        status: 'registered',
        reviewStatus: 'pending_review',
        registeredAt: new Date(),
      }),
      createGeneralDetail,
    } as unknown as EnrollmentsRepository;
    const eventPolicy = {
      assertEventExists: jest.fn().mockResolvedValue(undefined),
    } as unknown as EventPolicy;
    const enrollmentPolicy = {
      assertEventOpenForEnrollment: jest.fn(),
      assertNotAlreadyEnrolled: jest.fn().mockResolvedValue(undefined),
    } as unknown as EnrollmentPolicy;
    const enrollmentApprovalPolicy = {} as EnrollmentApprovalPolicy;
    const eventAuthorizationPolicy = {} as EventAuthorizationPolicy;
    const auditService = { log: jest.fn().mockResolvedValue(undefined) };
    const rateLimitService = { consume: jest.fn() };
    const idempotencyService = {
      normalizeKey: jest.fn().mockReturnValue(null),
      get: jest.fn(),
      set: jest.fn(),
    };
    const eventsService = {
      findEventById: jest.fn().mockResolvedValue({
        id: 'event-2',
        name: 'Event B',
        programType: 'NON_KSR',
        status: 'published',
        startDate: new Date(),
        endDate: new Date(),
      }),
    } as unknown as EventsService;
    const authService = {
      extractBearerToken: jest.fn().mockReturnValue(null),
    } as unknown as AuthService;
    const service = new EnrollmentsService(
      request as never,
      enrollmentsRepository,
      eventPolicy,
      enrollmentPolicy,
      enrollmentApprovalPolicy,
      eventAuthorizationPolicy,
      eventsService,
      authService,
      auditService as never,
      rateLimitService as never,
      idempotencyService as never,
    );
    const dto: CreateGeneralEnrollmentDto = {
      participantName: 'Sari',
      unsurPmi: 'RELAWAN',
      nik: '1234567890123457',
      birthPlace: 'Jakarta',
      birthDate: '1999-01-01',
      gender: 'P',
      address: 'Jl. Melati',
      phoneNumber: '08123456787',
      email: 'sari@example.com',
      education: 'S1',
      occupation: 'Relawan',
      bloodType: 'A',
      emergencyContactName: 'Budi',
      emergencyContactPhone: '08123456786',
    };

    const result = await service.createGeneral('event-2', dto);

    expect(result.enrollmentId).toBe('enroll-2');
    expect(createGeneralDetail).toHaveBeenCalledTimes(1);
  });

  it('attaches enrollment document for owner', async () => {
    const assertEnrollmentOwner = jest.fn();
    const enrollmentsRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'enroll-3',
        eventId: 'event-3',
        userId: 'user-3',
        participantName: 'Dina',
        status: 'registered',
        reviewStatus: 'pending_review',
        registeredAt: new Date(),
      }),
      attachDocument: jest.fn().mockResolvedValue('doc-1'),
    } as unknown as EnrollmentsRepository;
    const enrollmentPolicy = {
      assertEnrollmentOwner,
    } as unknown as EnrollmentPolicy;
    const service = new EnrollmentDocumentsService(
      enrollmentsRepository,
      enrollmentPolicy,
    );

    const result = await service.attachDocument(
      'enroll-3',
      'sertifikat_ksr_dasar',
      'bucket/key.pdf',
      { userId: 'user-3', enrollments: [] },
    );

    expect(result.documentId).toBe('doc-1');
    expect(assertEnrollmentOwner).toHaveBeenCalledTimes(1);
  });
});
