import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  // 1. Create a single room (Standard)
  async create(createRoomDto: CreateRoomDto) {
    const room = this.roomsRepository.create(createRoomDto);
    return await this.roomsRepository.save(room);
  }

  // 2. SEED rooms (Hackathon Special)
  async seed(createRoomDtos: CreateRoomDto[]) {
    const rooms = this.roomsRepository.create(createRoomDtos);
    return await this.roomsRepository.save(rooms);
  }

  // 3. Get All Rooms (For Admin Dashboard)
  async findAll() {
    return await this.roomsRepository.find({
      relations: ['bookings'],
      order: { number: 'ASC' },
    });
  }

  // 4. Get Available Rooms (For Guest Booking Wizard)
  async findAvailable() {
    return await this.roomsRepository.find({
      // 👇 2. Use the Enum value instead of "as any"
      where: { status: RoomStatus.AVAILABLE },
    });
  }

  // 5. Get One Room
  async findOne(id: string) {
    return await this.roomsRepository.findOne({ where: { id } });
  }
}
