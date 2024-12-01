import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('advice')
export class AdviceController {
    constructor(private readonly openAIService: OpenAIService) {}

    @Post()
    async getAdvice(@Body('prompt') prompt: string) {
        const advice = await this.openAIService.getAdvice(prompt);
        return { advice };
    }
}
