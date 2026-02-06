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
import { AssessmentService } from './assessment.service';
import { CreateAssessmentInstrumentDto } from './create-assessment-instrument.dto';

@Controller('events/:eventId/assessments')
export class EventAssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('instruments')
  createInstrument(
    @Param('eventId') eventId: string,
    @Body() dto: CreateAssessmentInstrumentDto,
  ): Promise<{ instrumentId: string }> {
    return this.assessmentService.createInstrument(eventId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('recap')
  getRecap(@Param('eventId') eventId: string): Promise<{
    eventId: string;
    enrollments: {
      enrollmentId: string;
      participantName: string;
      displayName?: string;
      averageScore: number | null;
      submissionCount: number;
      totalItems: number;
    }[];
  }> {
    return this.assessmentService.getRecap(eventId);
  }
}
