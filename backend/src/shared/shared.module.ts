import { Module } from '@nestjs/common';
import { AiIntegrationService } from './ai-integration.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [AiIntegrationService],
    exports: [AiIntegrationService],
})
export class SharedModule { }
