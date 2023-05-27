import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../ormconfig';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { PageModule } from './page/page.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackController } from './feedback/feedback.controller';
import { BannerController } from './banner/banner.controller';
import * as dotenv from 'dotenv';
import { FeedbackModule } from './feedback/feedback.module';
import { BannerModule } from './banner/banner.module';
import { StripeModule } from './stripe/stripe.module';
import { StripeController } from './stripe/stripe.controller';
import { ReferralController } from './referral/referral.controller';
import { ReferralModule } from './referral/referral.module';
import { HealthModule } from './health/health.module';
import { PartnerModule } from './partner/partner.module';
import { PartnerController } from './partner/partner.controller';
import { UserModule } from './user/user.module';
dotenv.config();

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
      port: Number(process.env.DEVTOOLS_PORT),
    }),
    TypeOrmModule.forRoot(config),
    PageModule,
    AuthModule,
    FeedbackModule,
    BannerModule,
    StripeModule,
    ReferralModule,
    HealthModule,
    PartnerModule,
    UserModule,
  ],
  controllers: [
    AppController,
    FeedbackController,
    BannerController,
    StripeController,
    ReferralController,
    PartnerController,
  ],
  providers: [AppService],
})
export class AppModule {}
