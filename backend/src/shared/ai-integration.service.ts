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
        return {
            fields: {},
            validation: [],
            confidence: { overall: 0 },
            reasoning: "AI service connection failed. Please ensure Ollama is running with the 'gemma2:2b' model pulled."
        };
    }
}


