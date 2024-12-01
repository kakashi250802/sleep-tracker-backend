import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { AdviceController } from './openai.controller';

@Module({
    controllers: [AdviceController],
    providers: [OpenAIService],
    exports:[OpenAIService]
})
export class AdviceModule {}
