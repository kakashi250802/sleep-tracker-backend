import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SleepReportsService } from './sleep-reports.service';
import { SleepReport } from '../entities/sleepReport/sleepReport.entities';
import { UpdateSleepReportDto } from '../sleep/dto/sleepReport.dto';


@Controller('sleep-reports')
export class SleepReportsController {
  constructor(private readonly sleepReportsService: SleepReportsService) {}



  // Get all sleep reports
  @Get()
  async findAll(): Promise<SleepReport[]> {
    return await this.sleepReportsService.findAll();
  }

  // Get a single sleep report by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<SleepReport> {
    return await this.sleepReportsService.findOne(id);
  }

  // Update an existing sleep report
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSleepReportDto: UpdateSleepReportDto,
  ): Promise<SleepReport> {
    return await this.sleepReportsService.update(id, updateSleepReportDto);
  }

  // Delete a sleep report by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.sleepReportsService.remove(id);
  }
}
