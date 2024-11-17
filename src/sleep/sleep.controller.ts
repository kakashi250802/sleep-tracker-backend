import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { SleepService } from './sleep.service';
import { CreateSleepHeartDto } from './dto/sleepHeart.dto';
import { CreateSleepTimeDto } from './dto/sleepTime.dto';
import { AuthGuard } from '../auth/guard/jwt-auth.guard';

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

    @Get('get-records/:days')
    @UseGuards(AuthGuard) // Xác thực JWT
    async getSleepRecords(

    @Param('days') days: number,
    @Request() req,

    ) {
        const userId = req.user.sub;
      return this.sleepService.getSleepRecords(userId, days);
    }


    @Post('get-records-by-date')
    @UseGuards(AuthGuard) // Xác thực JWT
    async getSleepRecordByDate(
    
        @Query('userId') userId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Request() req, 

    ) {
        console.log(userId,startDate,endDate);
        const start = new Date(startDate);
        start.setHours(12, 0, 0, 0)
        const end = new Date(endDate);
        end.setHours(12, 0, 0, 0)
      return this.sleepService.getSleepRecordByDate(userId, start, end);
    }

    
}
