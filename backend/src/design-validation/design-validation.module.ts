import { Module } from '@nestjs/common';
import { DesignValidationController } from './design-validation.controller';
import { DesignValidationService } from './design-validation.service';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [DesignValidationController],
    providers: [DesignValidationService],
})
export class DesignValidationModule { }
