import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateKsrBasicEnrollmentDto } from './create-ksr-basic-enrollment.dto';
import { CreateGeneralEnrollmentDto } from './create-general-enrollment.dto';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';

@Controller('events/:eventId/enrollments')
export class EventEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('ksr-basic')
  createKsrBasic(
    @Param('eventId') eventId: string,
    @Body() dto: CreateKsrBasicEnrollmentDto,
  ): Promise<{ enrollmentId: string }> {
    return this.enrollmentsService.createKsrBasic(eventId, dto);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('general')
  createGeneral(
    @Param('eventId') eventId: string,
    @Body() dto: CreateGeneralEnrollmentDto,
  ): Promise<{ enrollmentId: string }> {
    return this.enrollmentsService.createGeneral(eventId, dto);
  }
}
