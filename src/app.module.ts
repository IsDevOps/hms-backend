import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/entities/user.entity';
import { Room } from './rooms/entities/room.entity';
import { Booking } from './bookings/entities/booking.entity';
import { ServiceRequest } from './service-requests/entities/service-request.entity';
import { AiModule } from './ai/ai.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Room, Booking, ServiceRequest],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RoomsModule,
    BookingsModule,
    ServiceRequestsModule,
    ActivityLogModule,
    AiModule,
    EventsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
