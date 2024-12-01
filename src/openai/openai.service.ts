import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        // Khởi tạo OpenAI với API key từ file .env
        this.openai = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY,
        });
    }

    async getAdvice(prompt: string): Promise<string> {
        try {
            // Sử dụng phương thức tạo completion
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o', // Hoặc 'text-davinci-003', tùy vào nhu cầu
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100,
                temperature: 0.7,
            });

            // Trả về nội dung từ OpenAI
            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI API Error:', error.message);
            throw error;
        }
    }
}
