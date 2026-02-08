import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRole } from '../../core/event-context/event-role.decorator';
import {
  DecideGraduationDto,
  GraduationDecisionsResponseDto,
} from './graduations.dto';
import { GraduationService } from './graduations.service';

@Controller('events/:eventId/graduations')
@UseGuards(AuthGuard, EventContextGuard)
export class GraduationsController {
  constructor(private readonly graduationService: GraduationService) {}

  @EventRole('PANITIA', 'PELATIH')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('decide')
  decide(
    @Param('eventId') eventId: string,
    @Body() dto: DecideGraduationDto,
  ): Promise<{ decisionId: string }> {
    return this.graduationService.decide(
      eventId,
      dto.enrollmentId,
      dto.decision,
      dto.note,
    );
  }

  @EventRole('PANITIA', 'PELATIH', 'OBSERVER')
  @Get()
  listByEvent(
    @Param('eventId') eventId: string,
  ): Promise<GraduationDecisionsResponseDto> {
    return this.graduationService.listByEvent(eventId);
  }
}
