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
import { CreateKapInstrumentDto } from './create-kap-instrument.dto';

@Controller('events/:eventId/kap')
export class EventKapController {
  constructor(private readonly kapService: KapService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post('instruments')
  createInstrument(
    @Param('eventId') eventId: string,
    @Body() dto: CreateKapInstrumentDto,
  ): Promise<{ instrumentId: string }> {
    return this.kapService.createInstrument(eventId, dto);
  }
}
