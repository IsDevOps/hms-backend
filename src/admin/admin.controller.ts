import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get KPI Stats (Occupancy, Revenue)' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Trigger AI Analysis on (Fake) Sensor Data' })
  getAnomalies() {
    return this.adminService.checkAnomalies();
  }
}
