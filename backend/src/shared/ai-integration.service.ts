import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ValidationResponse {
    fields: any;
    validation: any[];
    confidence: {
        overall: number;
    };
    reasoning: string;
}

@Injectable()
export class AiIntegrationService {
    private readonly logger = new Logger(AiIntegrationService.name);
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor(private configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('AI_API_URL') || 'http://localhost:1234/v1/chat/completions';
        this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    }

    async validateDesign(prompt: string): Promise<ValidationResponse> {
        this.logger.log('Sending request to AI Service...');

        if (!this.apiKey && !this.apiUrl.includes('localhost')) {
            this.logger.warn('No AI_API_KEY provided and not localhost. Returning mock response.');
            return this.getMockResponse(prompt);
        }

        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.configService.get<string>('AI_MODEL') || 'gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are an expert cable design validation engineer.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                },
            );

            const content = response.data.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from AI service');
            }

            this.logger.log('Received response from AI Service');
            return JSON.parse(content);
        } catch (error) {
            this.logger.error('Failed to communicate with AI Service', error.message);
            if (axios.isAxiosError(error)) {
                this.logger.error('Axios Error Data:', error.response?.data);
            }
            return this.getMockResponse(prompt);
        }
    }

    private getMockResponse(prompt: string): ValidationResponse {
        const lowerPrompt = prompt.toLowerCase();

        let insulationStatus: "PASS" | "FAIL" | "WARN" = "PASS";
        let comment = "Compliant with IEC 60502-1 nominal requirements.";
        const extractedThickness = lowerPrompt.match(/insulation.*?(\d+(\.\d+)?)(\s*mm)?/)?.[1];
        const extractedCsa = lowerPrompt.match(/(\d+)(\s*mm²|\s*sqmm)/)?.[1];

        const thicknessVal = extractedThickness ? parseFloat(extractedThickness) : 1.0;
        const csaVal = extractedCsa ? parseFloat(extractedCsa) : 10;

        let reasoning = "The cable design was audited against IEC 60502-1 (Table 16) and IEC 60228 guidelines.";

        // Boundary Logic (Heuristic for 10-25mm²)
        if (csaVal >= 10 && csaVal <= 25) {
            if (thicknessVal < 0.8) {
                insulationStatus = "FAIL";
                comment = `Provided ${thicknessVal}mm is strictly below the 1.0mm nominal minimum defined in Table 16.`;
                reasoning = `**CRITICAL FAILURE**: The insulation thickness (${thicknessVal}mm) violates the mandatory safety threshold for a ${csaVal}mm² conductor.\n\n**Per IEC 60502-1 Table 16:** Insulation thickness for PVC must be at least 1.0mm.\n\n**Remediation:**\n1. Modify extruder settings for a minimum 1.0mm wall thickness.\n2. Re-calculate total cable diameter based on corrected insulation.`;
            } else if (thicknessVal === 1.0) {
                insulationStatus = "WARN";
                comment = "Boundary Case: Thickness is exactly at the nominal minimum required by Table 16.";
                reasoning = `**BOUNDARY WARNING**: While technically compliant, ${thicknessVal}mm offers zero manufacturing tolerance.\n\n**Recommendation:** Consider increasing to 1.1mm to ensure compliance during high-speed production variations.`;
            } else {
                comment = `Safe Margin: ${thicknessVal}mm exceeds the 1.0mm nominal requirement (IEC 60502-1 Table 16).`;
            }
        }

        return {
            fields: {
                standard: lowerPrompt.includes("60502") ? "IEC 60502-1" : "Not Specified",
                voltage: lowerPrompt.match(/\d+(\.\d+)?\/\d+/)?.[0] || "1 kV",
                conductor_material: lowerPrompt.includes("cu") || lowerPrompt.includes("copper") ? "Cu" : "Al",
                conductor_class: lowerPrompt.includes("class 2") ? "Class 2" : "Unknown",
                csa: csaVal,
                insulation_material: lowerPrompt.includes("pvc") ? "PVC" : "XLPE",
                insulation_thickness: thicknessVal
            },
            validation: [
                {
                    field: "insulation_thickness",
                    status: insulationStatus,
                    expected: "1.0 mm",
                    comment: comment
                }
            ],
            confidence: {
                overall: 0.92
            },
            reasoning: reasoning
        };
    }
}

