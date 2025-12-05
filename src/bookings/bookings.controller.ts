import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Booking + AI Check + ID Upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        guestName: { type: 'string' },
        guestEmail: { type: 'string' },
        roomId: { type: 'string' },
        checkInDate: { type: 'string' },
        checkOutDate: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createBookingDto: CreateBookingDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.bookingsService.create(createBookingDto, file.buffer);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Bookings' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Bulk Create Bookings from Helper JSON' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          roomNumber: { type: 'string', example: '101' },
          guestName: { type: 'string', example: 'Alice Seed' },
          guestEmail: { type: 'string', example: 'alice@test.com' },
          checkInDate: { type: 'string', example: '2023-12-01' },
          checkOutDate: { type: 'string', example: '2023-12-05' },
          status: { type: 'string', example: 'CHECKED_OUT' },
          fraudScore: { type: 'number', example: 10 },
        },
      },
    },
  })
  seed(@Body() seedData: any[]) {
    return this.bookingsService.seed(seedData);
  }


  @Get(':id')
  @ApiOperation({
    summary: 'Get a single booking by ID (with Guest & Room details)',
  })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
