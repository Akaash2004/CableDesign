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
      inputDescription += `### STRUCTURED DESIGN DATA\n${JSON.stringify(dto.structuredData, null, 2)}\n`;
    }
    if (dto.freeText) {
      inputDescription += `### FREE-TEXT ENGINEERING DESCRIPTION\n"${dto.freeText}"\n`;
    }

    return `
You are a Senior Cable Engineering Auditor specialized in IEC 60502-1 and IEC 60228 standards.
Your mission is to perform a rigorous technical audit of the provided cable design.

### ENGINEERING KNOWLEDGE BASE (STRICT RULES)
1. **Insulation Thickness (IEC 60502-1 Table 16 - PVC):**
   - CSA 1.5 mm² to 6 mm²: Nominal thickness = 0.8 mm
   - CSA 10 mm² to 25 mm²: Nominal thickness = 1.0 mm
   - CSA 35 mm²: Nominal thickness = 1.2 mm
2. **Conductor Material (IEC 60228):**
   - Cu (Copper), Al (Aluminum).
3. **Conductor Class (IEC 60228):**
   - Class 2: Stranded.
   - Class 5: Flexible.
4. **Voltage Rating:**
   - Standard Low Voltage (LV) is typically 0.6/1 kV.

### VALIDATION PROTOCOL (SIGNALS)
- **PASS**: Parameter meets or exceeds nominal requirement with a safe margin.
- **WARN**: 
  - Boundary Case: Parameter exactly matches the nominal minimum (zero margin).
  - Ambiguity: Required info (Standard/Voltage) is missing; you must assume and explain.
- **FAIL**: Parameter is strictly below the mandatory IEC threshold.

### YOUR AUDIT STEPS
1. **Extraction**: Parse the input into a structured format. Handle abbreviations like "sqmm", "Cu", "t_i".
2. **Field-by-Field Audit**: Compare each parameter against the Knowledge Base above.
3. **Reasoning Engine**: 
   - Cite specific tables (e.g., "Per Table 16 of IEC 60502-1...").
   - For FAIL/WARN, provide clear "Remediation Steps".
   - Provide an overall audit summary.

### OUTPUT SCHEMA (STRICT JSON ONLY)
{
  "fields": {
    "standard": string,
    "voltage": string,
    "conductor_material": string,
    "conductor_class": string,
    "csa": number,
    "insulation_material": string,
    "insulation_thickness": number
  },
  "validation": [
    {
      "field": string,
      "status": "PASS" | "FAIL" | "WARN",
      "expected": string,
      "comment": string
    }
  ],
  "confidence": { "overall": number },
  "reasoning": "Markdown format: Overall audit summary, detailed table-based justification, and remediation steps."
}

---
AUDIT INPUT:
${inputDescription}
---
    `;
  }
}
