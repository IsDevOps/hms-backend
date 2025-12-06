import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { AiModule } from 'src/ai/ai.module';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Room, ServiceRequest]),
    AiModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
