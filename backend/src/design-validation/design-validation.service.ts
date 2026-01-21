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
You are an expert Cable Design Auditor specialized in IEC 60502-1 and IEC 60228.

### TECHNICAL CONTEXT (GROUNDING)
- IEC 60502-1 Table 16 (PVC Insulation):
    - 1.5 - 6 mm²: 0.8 mm nominal thickness
    - 10 - 25 mm²: 1.0 mm nominal thickness
    - 35 mm²: 1.2 mm nominal thickness
- IEC 60228 (Conductor classes):
    - Class 2: Stranded circular or shaped.
    - Class 5: Flexible.

### VALIDATION SIGNALS
- PASS: Meets requirement with safe margin.
- WARN (Boundary Case): Meets requirement exactly or is at nominal threshold limit.
- WARN (Missing Info): Critical fields like Standard/Voltage missing; state your assumption.
- FAIL: Strictly below the minimum standards thresholds.

### TASK
1. Extract attributes (Standard, Voltage, Material, Class, CSA, Insulation). Normalize units (sqmm -> mm²).
2. Validate each attribute strictly against the provided TECHNICAL CONTEXT.
3. Your "comment" for each field MUST explain the technical margin.
4. Your "reasoning" (Overall) MUST cite specific IEC tables and provide remediation steps if not PASS.

### RETURN FORMAT (JSON ONLY)
{
  "fields": { "standard": "...", "csa": 10, ... },
  "validation": [
    { "field": "insulation_thickness", "status": "FAIL", "expected": "1.0 mm", "comment": "Provided 0.5mm is 50% below Table 16 requirement." }
  ],
  "confidence": { "overall": 0.95 },
  "reasoning": "Detailed audit summary citing standards and remediation."
}

Input for Audit:
${inputDescription}
`;
  }
}
