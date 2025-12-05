import { Controller, Get, Param } from '@nestjs/common';
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

  // ... inside AdminController ...

  @Get('anomalies/:roomId')
  @ApiOperation({ summary: 'Get AI Analysis for a specific Room' })
  getRoomAnomaly(@Param('roomId') roomId: string) {
    return this.adminService.checkAnomalies(roomId);
  }
}
