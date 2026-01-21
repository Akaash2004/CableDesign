import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class ValidationRequestDto {
    @IsOptional()
    @IsString()
    freeText?: string;

    @IsOptional()
    @IsObject()
    structuredData?: Record<string, any>; // Flexible for now, or specify known fields
}
