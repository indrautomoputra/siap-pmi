import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { IsUUID } from 'class-validator';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './enrollments.types';
import { EventId } from '../events/events.types';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { CurrentEvent } from '../../core/event-context/current-event.decorator';
import type { CurrentEventContext } from '../../core/event-context/event-context.types';
import { AttachEnrollmentDocumentDto } from './attach-enrollment-document.dto';
import { EnrollmentDocumentsService } from './enrollment-documents.service';
import { AuthService } from '../../infrastructure/auth/auth.service';
import type { CurrentUser as AuthCurrentUser } from '../../infrastructure/auth/auth.service';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { CurrentUser } from '../../core/auth-context/current-user.decorator';

class CreateEnrollmentRequestDto {
  @IsUUID()
  event_id: string;

  @IsUUID()
  user_id: string;
}

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly enrollmentDocumentsService: EnrollmentDocumentsService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard, EventContextGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  createEnrollment(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @CurrentUser()
    currentUser: AuthCurrentUser | CurrentUserContext | undefined,
    @Body() dto: CreateEnrollmentRequestDto,
  ): Promise<{ enrollmentId: string }> {
    if (!currentEvent?.eventId) {
      throw new Error('Event context is missing');
    }
    if (dto.event_id !== currentEvent.eventId) {
      throw new Error('event_id tidak sesuai dengan event pada context');
    }
    const userId =
      currentUser && 'userId' in currentUser
        ? currentUser.userId
        : currentUser?.id;
    if (!userId) {
      throw new Error('Missing current user');
    }
    if (dto.user_id !== userId) {
      throw new Error('user_id tidak sesuai dengan user saat ini');
    }
    return this.enrollmentsService.createEnrollmentForUser(
      currentEvent.eventId,
      userId,
    );
  }

  registerParticipant(enrollment: Enrollment): Promise<Enrollment> {
    return this.enrollmentsService.registerParticipant(enrollment);
  }

  findByEventId(eventId: EventId): Promise<Enrollment[]> {
    return this.enrollmentsService.findByEventId(eventId);
  }

  updateEnrollmentStatus(): void {
    void this.enrollmentsService.updateEnrollmentStatus();
  }

  cancelEnrollment(): void {
    void this.enrollmentsService.cancelEnrollment();
  }

  @UseGuards(AuthGuard, EventContextGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post(':id/documents')
  async attachDocument(
    @Param('id') enrollmentId: string,
    @Body() dto: AttachEnrollmentDocumentDto,
    @Req() request: Request,
  ): Promise<{ documentId: string }> {
    const user = await getCurrentUser(request, this.authService);
    return this.enrollmentDocumentsService.attachDocument(
      enrollmentId,
      dto.docType,
      dto.filePath,
      user,
    );
  }

  @UseGuards(AuthGuard, EventContextGuard)
  @Post(':id/approve')
  async approveEnrollment(
    @Param('id') enrollmentId: string,
    @Body('note') note?: string,
    @Req() request?: Request,
  ): Promise<{ enrollmentId: string; reviewStatus: string }> {
    const normalizedNote = typeof note === 'string' ? note : undefined;
    const user = request
      ? await getCurrentUser(request, this.authService)
      : undefined;
    return this.enrollmentsService.approveEnrollment(
      enrollmentId,
      normalizedNote,
      user,
    );
  }

  @UseGuards(AuthGuard, EventContextGuard)
  @Post(':id/reject')
  async rejectEnrollment(
    @Param('id') enrollmentId: string,
    @Body('note') note?: string,
    @Req() request?: Request,
  ): Promise<{ enrollmentId: string; reviewStatus: string }> {
    const normalizedNote = typeof note === 'string' ? note : undefined;
    const user = request
      ? await getCurrentUser(request, this.authService)
      : undefined;
    return this.enrollmentsService.rejectEnrollment(
      enrollmentId,
      normalizedNote,
      user,
    );
  }
}
