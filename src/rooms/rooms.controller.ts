import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Rooms') // Groups these endpoints in Swagger
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a single room' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Bulk create rooms from JSON (Hackathon utility)' })
  @ApiResponse({ status: 201, description: 'Rooms successfully seeded' })
  seed(@Body() createRoomDtos: CreateRoomDto[]) {
    return this.roomsService.seed(createRoomDtos);
  }

  @Get()
  @ApiOperation({ summary: 'Get ALL rooms (Admin Dashboard)' })
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get only AVAILABLE rooms (Guest Booking)' })
  findAvailable() {
    return this.roomsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
}
