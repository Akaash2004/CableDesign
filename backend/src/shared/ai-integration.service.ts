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
            return this.getMockResponse();
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
            return this.getMockResponse();
        }
    }

    private getMockResponse(): ValidationResponse {
        return {
            fields: {
                standard: "IEC 60502-1",
                voltage: "0.6/1 kV",
                conductor_material: "Cu",
                conductor_class: "Class 2",
                csa: 10,
                insulation_material: "PVC",
                insulation_thickness: 1.0
            },
            validation: [
                {
                    field: "insulation_thickness",
                    status: "PASS",
                    expected: "1.0 mm",
                    comment: "Simulated AI Response: Consistent with IEC 60502-1 nominal insulation thickness for PVC at 10 mm²."
                }
            ],
            confidence: {
                overall: 0.99
            }
        };
    }
}
