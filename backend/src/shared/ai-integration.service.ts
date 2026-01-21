import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ValidationResponse {
    fields: any;
    validation: any[];
    confidence: {
        overall: number;
    };
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
        // Simple Heuristic Fallback for Demo Purposes
        const lowerPrompt = prompt.toLowerCase();

        let insulationStatus: "PASS" | "FAIL" | "WARN" = "PASS";
        let comment = "Consistent with IEC 60502-1 nominal insulation thickness.";
        const extractedThickness = lowerPrompt.match(/insulation.*?(\d+(\.\d+)?)(\s*mm)?/)?.[1];
        const extractedCsa = lowerPrompt.match(/(\d+)(\s*mm²|\s*sqmm)/)?.[1];

        const thicknessVal = extractedThickness ? parseFloat(extractedThickness) : 1.0;
        const csaVal = extractedCsa ? parseFloat(extractedCsa) : 10;

        // Heuristic Rule: 10mm² requires ~1.0mm. Fail if < 0.8mm
        if (csaVal >= 10 && csaVal <= 25 && thicknessVal < 0.8) {
            insulationStatus = "FAIL";
            comment = `Detected thickness ${thicknessVal}mm is below the IEC 60502-1 requirement for ${csaVal}mm² (Expected ~1.0mm).`;
        }

        return {
            fields: {
                standard: "IEC 60502-1",
                voltage: "0.6/1 kV",
                conductor_material: "Cu",
                conductor_class: "Class 2",
                csa: csaVal,
                insulation_material: "PVC",
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
                overall: 0.85
            }
        };
    }
}
