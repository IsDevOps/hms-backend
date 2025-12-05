import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity'; // Adjust path if needed
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
  // Takes an array of rooms and saves them all at once.
  async seed(createRoomDtos: CreateRoomDto[]) {
    // Optional: Clear existing rooms to avoid duplicates during testing
    // await this.roomsRepository.clear();

    const rooms = this.roomsRepository.create(createRoomDtos);
    return await this.roomsRepository.save(rooms);
  }

  // 3. Get All Rooms (For Admin Dashboard)
  async findAll() {
    return await this.roomsRepository.find({
      order: { number: 'ASC' },
    });
  }

  // 4. Get Available Rooms (For Guest Booking Wizard)
  async findAvailable() {
    return await this.roomsRepository.find({
      where: { status: 'AVAILABLE' } as any, // Type casting if Enum check is strict
    });
  }

  // 5. Get One Room
  async findOne(id: string) {
    return await this.roomsRepository.findOne({ where: { id } });
  }
}
