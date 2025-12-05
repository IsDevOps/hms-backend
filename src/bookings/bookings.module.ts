import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { User } from 'src/users/entities/user.entity';
import { EventsModule } from 'src/events/events.module';
import { SendGridService } from 'src/emails/sendgrid.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room, User]), EventsModule],
  controllers: [BookingsController],
  providers: [BookingsService, SendGridService],
})
export class BookingsModule {}
