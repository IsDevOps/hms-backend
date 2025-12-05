import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway'; // The Socket Gateway
import { Room } from '../rooms/entities/room.entity';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private aiService: AiService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createBookingDto: CreateBookingDto, idImageBuffer: Buffer) {
    this.logger.log(`📝 Processing booking for: ${createBookingDto.guestName}`);

    // 1. Validate Room
    const room = await this.roomRepo.findOne({
      where: { id: createBookingDto.roomId },
    });
    if (!room) throw new NotFoundException('Room not found');

    // 2. Find or Create Guest
    let user = await this.userRepo.findOne({
      where: { email: createBookingDto.guestEmail },
    });
    if (!user) {
      user = this.userRepo.create({
        email: createBookingDto.guestEmail,
        name: createBookingDto.guestName,
        role: UserRole.GUEST,
      });
      await this.userRepo.save(user);
    }

    // 3. 🤖 AI Analysis (ID + Fraud)
    const base64Image = idImageBuffer.toString('base64');

    // Check ID
    const aiIdResult = await this.aiService.analyzeID(base64Image);

    // Check Context (Fraud)
    const fraudContext = {
      bookingName: createBookingDto.guestName,
      idName: aiIdResult.extractedName,
      idIsValid: aiIdResult.isValid,
      email: createBookingDto.guestEmail,
    };
    const fraudCheck = await this.aiService.checkBookingFraud(fraudContext);

    // 4. Generate Digital Key
    const qrKey = `KEY-${room.number}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // 5. Save to DB
    const booking = this.bookingRepo.create({
      ...createBookingDto,
      guest: user,
      room: room,
      fraudScore: fraudCheck.fraudScore || 0,
      fraudReason: fraudCheck.reason || 'None',
      qrCodeSecret: qrKey,
      status: BookingStatus.CONFIRMED,
    });

    const savedBooking = await this.bookingRepo.save(booking);

    // 6. 📡 WebSocket Trigger (Notify Admin)
    this.eventsGateway.notifyNewBooking({
      id: savedBooking.id,
      guestName: user.name,
      roomNumber: room.number,
      fraudScore: savedBooking.fraudScore,
      timestamp: new Date(),
    });

    if (savedBooking.fraudScore > 75) {
      this.eventsGateway.notifyFraudAlert({
        message: `High Risk Booking Detected: Room ${room.number}`,
        reason: savedBooking.fraudReason,
      });
    }

    return savedBooking;
  }

  async findAll() {
    return await this.bookingRepo.find({
      relations: ['guest', 'room'],
      order: { createdAt: 'DESC' },
    });
  }

  // ... inside BookingsService class ...

  // SPECIAL SEED FUNCTION (For Hackathon Data Injection)
  async seed(seedData: any[]) {
    const results: Booking[] = [];
    for (const item of seedData) {
      try {
        // 1. Find Room by Number (e.g., "101") instead of UUID
        const room = await this.roomRepo.findOne({
          where: { number: item.roomNumber },
        });
        if (!room) {
          console.warn(
            `⚠️ Skipping seed item: Room ${item.roomNumber} not found.`,
          );
          continue;
        }

        // 2. Find or Create User
        let user = await this.userRepo.findOne({
          where: { email: item.guestEmail },
        });
        if (!user) {
          user = this.userRepo.create({
            email: item.guestEmail,
            name: item.guestName,
            role: UserRole.GUEST,
          });
          await this.userRepo.save(user);
        }

        // 3. Create the Booking
        const booking = this.bookingRepo.create({
          checkInDate: item.checkInDate,
          checkOutDate: item.checkOutDate,
          status: item.status || BookingStatus.CONFIRMED,
          fraudScore: item.fraudScore || 0,
          fraudReason: item.fraudReason || null,
          guest: user,
          room: room,
          qrCodeSecret: `SEED-KEY-${Math.random().toString(36).substring(7).toUpperCase()}`,
        });

        const saved = await this.bookingRepo.save(booking);
        if (!saved)
          throw new BadRequestException('Failed to save seeded booking');
        results.push(saved);
      } catch (e) {
        console.error('Failed to seed booking:', e);
      }
    }

    return { count: results.length, seeded: results };
  }
}
