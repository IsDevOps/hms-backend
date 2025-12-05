// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { ServiceRequestsService } from './service-requests.service';
// import { CreateServiceRequestDto } from './dto/create-service-request.dto';
// import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

// @Controller('service-requests')
// export class ServiceRequestsController {
//   constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

//   @Post()
//   create(@Body() createServiceRequestDto: CreateServiceRequestDto) {
//     return this.serviceRequestsService.create(createServiceRequestDto);
//   }

//   @Get()
//   findAll() {
//     return this.serviceRequestsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.serviceRequestsService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateServiceRequestDto: UpdateServiceRequestDto) {
//     return this.serviceRequestsService.update(+id, updateServiceRequestDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.serviceRequestsService.remove(+id);
//   }
// }

import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto, GetServiceRequestsDto } from './dto/create-service-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Priority, RequestStatus, ServiceType } from './entities/service-request.entity';
import { UpdateServiceRequestDto, UpdateServiceStatusRequestDto } from './dto/update-service-request.dto';

@ApiTags('Service Requests')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Guest requests a service (Food, Towels, Concierge)',
  })
  @ApiResponse({
    status: 201,
    description: 'Request created. AI priority assigned.',
  })
  create(@Body() createServiceRequestDto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(createServiceRequestDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all active requests (For Admin Dashboard List)',
  })
  @Get()
  findAll(@Query() query: GetServiceRequestsDto) {
    return this.serviceRequestsService.findAll(query.type);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Admin updates status (Triggers WebSocket update to Guest)',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateServiceStatusRequestDto: UpdateServiceStatusRequestDto,
  ) {
    return this.serviceRequestsService.updateStatus(
      id,
      updateServiceStatusRequestDto.status,
    );
  }

  @Post('seed')
  @ApiOperation({ summary: 'Bulk Create Service Requests (JSON Array)' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: Object.values(ServiceType),
            example: 'FOOD',
          },
          description: { type: 'string', example: 'Burger and Fries' },
          priority: {
            type: 'string',
            enum: Object.values(Priority),
            example: 'NORMAL',
          },
        },
      },
    },
  })
  seed(@Body() seedData: any[]) {
    return this.serviceRequestsService.seed(seedData);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete ALL service requests (Cleanup)' })
  removeAll() {
    return this.serviceRequestsService.removeAll();
  }
}
