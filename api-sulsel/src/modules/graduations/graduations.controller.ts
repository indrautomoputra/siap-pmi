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
import {
  DecideGraduationDto,
  GraduationDecisionsResponseDto,
} from './graduations.dto';
import { GraduationService } from './graduations.service';

@Controller('events/:eventId/graduations')
export class GraduationsController {
  constructor(private readonly graduationService: GraduationService) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get()
  listByEvent(
    @Param('eventId') eventId: string,
  ): Promise<GraduationDecisionsResponseDto> {
    return this.graduationService.listByEvent(eventId);
  }
}
