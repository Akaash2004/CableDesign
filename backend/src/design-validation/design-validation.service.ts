import { Injectable } from '@nestjs/common';
import { AiIntegrationService, ValidationResponse } from '../shared/ai-integration.service';
import { ValidationRequestDto } from './dto/validation-request.dto';

@Injectable()
export class DesignValidationService {
  constructor(private readonly aiService: AiIntegrationService) { }

  async validate(dto: ValidationRequestDto): Promise<ValidationResponse> {
    const prompt = this.buildPrompt(dto);
    console.log('Generated Prompt:', prompt);
    return this.aiService.validateDesign(prompt);
  }

  private buildPrompt(dto: ValidationRequestDto): string {
    let inputDescription = '';

    if (dto.structuredData) {
      inputDescription += `Structured Data: ${JSON.stringify(dto.structuredData, null, 2)}\n`;
    }
    if (dto.freeText) {
      inputDescription += `Free Text Input: "${dto.freeText}"\n`;
    }

    return `
You are an expert cable design validation engineer specializing in IEC 60502-1 and IEC 60228.
Your task is to validate the following cable design input against IEC standards.

Input:
${inputDescription}

Instructions:
1. Extract all meaningful design attributes (Standard, Voltage, Material, Class, CSA, Insulation, etc.).
2. Validate each attribute against IEC 60502-1 requirements.
   - Do NOT use hardcoded lookups if possible, use your internal knowledge of the standard.
   - For PVC insulation thickness:
     - 1.5mm² to 6mm² -> 0.8mm nominal
     - 10mm² to 25mm² -> 1.0mm nominal
     - etc. (Use your reasoning)
3. Return the result in the following JSON format:
{
  "fields": { ...extracted attributes... },
  "validation": [
    { "field": "attribute_name", "status": "PASS" | "FAIL" | "WARN", "expected": "value", "comment": "explanation" }
  ],
  "confidence": { "overall": 0.0 to 1.0 },
  "reasoning": "A detailed explanation of why the design passed or failed, including specific references to IEC 60502-1 and remediation steps if applicable."
}

If the input is ambiguous, use WARN and explain why.
If the input violates a standard (e.g. insulation too thin), use FAIL or WARN depending on severity.
`;
  }
}
