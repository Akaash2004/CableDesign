import { Body, Controller, Post } from '@nestjs/common';
import { DesignValidationService } from './design-validation.service';
import { ValidationRequestDto } from './dto/validation-request.dto';

@Controller('design')
export class DesignValidationController {
    constructor(private readonly designValidationService: DesignValidationService) { }

    @Post('validate')
    async validate(@Body() dto: ValidationRequestDto) {
        return this.designValidationService.validate(dto);
    }
}
