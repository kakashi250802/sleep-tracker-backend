import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { SleepService } from './sleep.service';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import { AuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('sleep')
export class SleepController {
    constructor(private readonly sleepService: SleepService) {}

    @Post('create-record')
    @UseGuards(AuthGuard) // Xác thực JWT
    async createSleepData(

      @Body('heartData') heartData: CreateSleepHeartDto[],
      @Body('sleepData') sleepData: CreateSleepTimeDto[],
    @Request() req,

    ) {
        const userId = req.user.sub;
      return this.sleepService.processAndSaveData(userId, heartData, sleepData);
    }
}
