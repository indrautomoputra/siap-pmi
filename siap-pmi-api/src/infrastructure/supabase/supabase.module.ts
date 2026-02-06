import {
  Inject,
  Injectable,
  Module,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { createSupabaseClient, SupabaseClientType } from './supabase.client';

type RequestWithSupabase = Request & { supabaseJwt?: string };

export abstract class SupabaseClientProvider {
  abstract getClient(): SupabaseClientType;
}

@Injectable()
export class SupabasePublicProvider extends SupabaseClientProvider {
  private readonly client: SupabaseClientType;

  constructor() {
    super();
    this.client = createSupabaseClient();
  }

  getClient(): SupabaseClientType {
    return this.client;
  }
}

@Injectable({ scope: Scope.REQUEST })
export class SupabaseProvider extends SupabaseClientProvider {
  private readonly client: SupabaseClientType;

  constructor(
    @Inject(REQUEST) private readonly request: RequestWithSupabase,
    private readonly authService: AuthService,
  ) {
    super();
    const token =
      this.request.supabaseJwt ??
      this.authService.extractBearerToken(
        this.request.headers.authorization ??
          this.request.headers.Authorization ??
          this.request.headers.AUTHORIZATION,
      );
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    this.client = createSupabaseClient({ jwt: token });
  }

  getClient(): SupabaseClientType {
    return this.client;
  }
}

@Module({
  imports: [AuthModule],
  providers: [
    SupabaseProvider,
    SupabasePublicProvider,
    { provide: SupabaseClientProvider, useExisting: SupabaseProvider },
  ],
  exports: [SupabaseProvider, SupabasePublicProvider, SupabaseClientProvider],
})
export class SupabaseModule {}
