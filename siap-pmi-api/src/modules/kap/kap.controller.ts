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
import { KapService } from './kap.service';
import { AddKapQuestionDto } from './add-kap-question.dto';
import { SubmitKapResponsesDto } from './submit-kap-responses.dto';

@Controller('kap/instruments')
export class KapController {
  constructor(private readonly kapService: KapService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post(':id/questions')
  addQuestion(
    @Param('id') instrumentId: string,
    @Body() dto: AddKapQuestionDto,
  ): Promise<{ questionId: string }> {
    return this.kapService.addQuestion(instrumentId, dto);
  }

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post(':id/submit')
  submitResponses(
    @Param('id') instrumentId: string,
    @Body() dto: SubmitKapResponsesDto,
  ): Promise<{ responseId: string }> {
    return this.kapService.submitResponses(instrumentId, dto);
  }
}
