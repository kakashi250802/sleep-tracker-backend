import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SleepReport } from '../entities/sleepReport/sleepReport.entities';
import { UpdateSleepReportDto } from '../sleep/dto/sleepReport.dto';
import { Repository } from 'typeorm';


@Injectable()
export class SleepReportsService {
  constructor(
    @InjectRepository(SleepReport)
    private readonly sleepReportRepository: Repository<SleepReport>,
  ) {}
  // Get all sleep reports
  async findAll(): Promise<SleepReport[]> {
    return await this.sleepReportRepository.find();
  }

  // Get a single sleep report by ID
  async findOne(id: number): Promise<SleepReport> {
    const report = await this.sleepReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Sleep report not found');
    }
    return report;
  }

  // Update an existing sleep report
  async update(id: number, updateSleepReportDto: UpdateSleepReportDto): Promise<SleepReport> {
    const report = await this.sleepReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Sleep report not found');
    }

    const updatedReport = Object.assign(report, updateSleepReportDto);
    return await this.sleepReportRepository.save(updatedReport);
  }

  // Delete a sleep report by ID
  async remove(id: number): Promise<void> {
    const report = await this.sleepReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Sleep report not found');
    }

    await this.sleepReportRepository.remove(report);
  }
}
