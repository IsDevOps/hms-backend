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

import { Controller, Get, Post, Body } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  findAll() {
    return this.serviceRequestsService.findAll();
  }
}
