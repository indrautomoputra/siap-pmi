import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './infrastructure/auth/auth.module';
import { SupabaseModule } from './infrastructure/supabase/supabase.module';
import { TrafficModule } from './infrastructure/traffic/traffic.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { EventRolesModule } from './modules/event-roles/event-roles.module';
import { EventsModule } from './modules/events/events.module';
import { KapModule } from './modules/kap/kap.module';
import { UsersModule } from './modules/users/users.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GraduationsModule } from './modules/graduations/graduations.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'src/.env' }),
    TrafficModule,
    AuthModule,
    SupabaseModule,
    EventsModule,
    EnrollmentsModule,
    EventRolesModule,
    KapModule,
    AssessmentModule,
    AssessmentsModule,
    UsersModule,
    DashboardModule,
    GraduationsModule,
    ExportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
