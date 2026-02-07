import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { AssessmentService } from './assessment.service';
import { AddAssessmentCriterionDto } from './add-assessment-criterion.dto';
import { SubmitAssessmentScoreDto } from './submit-assessment-score.dto';

@Controller('assessments/instruments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post(':id/criteria')
  addCriterion(
    @Param('id') instrumentId: string,
    @Body() dto: AddAssessmentCriterionDto,
  ): Promise<{ criterionId: string }> {
    return this.assessmentService.addCriterion(instrumentId, dto);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post(':id/score')
  submitScore(
    @Param('id') instrumentId: string,
    @Body() dto: SubmitAssessmentScoreDto,
  ): Promise<{ scoreId: string }> {
    return this.assessmentService.submitScore(instrumentId, dto);
  }
}
