// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import {
//   ServiceRequest,
//   ServiceType,
//   Priority,
// } from './entities/service-request.entity';
// import { CreateServiceRequestDto } from './dto/create-service-request.dto'; // You need to create this DTO
// import { AiService } from '../ai/ai.service';
// import { EventsGateway } from '../events/events.gateway';
// import { Booking } from '../bookings/entities/booking.entity';

// @Injectable()
// export class ServiceRequestsService {
//   constructor(
//     @InjectRepository(ServiceRequest)
//     private reqRepo: Repository<ServiceRequest>,
//     @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
//     private aiService: AiService,
//     private eventsGateway: EventsGateway,
//   ) {}

//   async create(createDto: CreateServiceRequestDto) {
//     // 1. Get the booking
//     const booking = await this.bookingRepo.findOne({
//       where: { id: createDto.bookingId },
//       relations: ['room', 'guest'],
//     });
//     if (!booking) throw new Error('Booking not found');

//     // 2. 🤖 AI SENTIMENT CHECK
//     // Only analyze if there is a text description (e.g., "Concierge" or "Complaint")
//     let aiPriority = Priority.NORMAL;
//     let sentiment = 'NEUTRAL';

//     if (createDto.description && createDto.description.length > 5) {
//       const analysis = await this.aiService.analyzeSentiment(
//         createDto.description,
//       );

//       // Map AI string result to Enum
//       if (analysis.priority === 'HIGH') aiPriority = Priority.HIGH;
//       sentiment = analysis.sentiment;
//     }

//     // 3. Save to DB
//     const request = this.reqRepo.create({
//       type: createDto.type, // FOOD, TOWELS, CONCIERGE
//       description: createDto.description || 'Quick Action',
//       priority: aiPriority, // Set by AI
//       booking: booking,
//     });

//     const savedRequest = await this.reqRepo.save(request);

//     // 4. 📡 Notify Admin (Real-time)
//     this.eventsGateway.notifyServiceRequest({
//       id: savedRequest.id,
//       roomNumber: booking.room.number,
//       guestName: booking.guest.name,
//       type: savedRequest.type,
//       priority: savedRequest.priority, // Admin sees this!
//       sentiment: sentiment, // Admin sees this!
//       message: createDto.description,
//     });

//     return savedRequest;
//   }

//   // Add findAll if needed...
// }

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest, Priority } from './entities/service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);

  constructor(
    @InjectRepository(ServiceRequest)
    private reqRepo: Repository<ServiceRequest>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    private aiService: AiService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createDto: CreateServiceRequestDto) {
    // 1. Find the Booking (and the Room/Guest info for the notification)
    const booking = await this.bookingRepo.findOne({
      where: { id: createDto.bookingId },
      relations: ['room', 'guest'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking with ID ${createDto.bookingId} not found`,
      );
    }

    // 2. 🤖 AI SENTIMENT CHECK
    // Default to NORMAL priority
    let priority = Priority.NORMAL;
    let sentimentAnalysis = 'Neutral request';

    // Only ask AI if there is enough text to analyze (> 5 chars)
    if (createDto.description && createDto.description.length > 5) {
      this.logger.log(`🧠 Analyzing sentiment for: "${createDto.description}"`);
      const aiResult = await this.aiService.analyzeSentiment(
        createDto.description,
      );

      // If AI says HIGH, we upgrade the ticket
      if (aiResult.priority === 'HIGH') {
        priority = Priority.HIGH;
        this.logger.warn(`🔥 URGENT REQUEST DETECTED: ${aiResult.analysis}`);
      }
      sentimentAnalysis = aiResult.analysis || 'AI processed';
    }

    // 3. Save to Database
    const request = this.reqRepo.create({
      type: createDto.type,
      description: createDto.description || `Request for ${createDto.type}`,
      priority: priority,
      status: 'OPEN',
      booking: booking,
    });

    const savedRequest = await this.reqRepo.save(request);

    // 4. 📡 Notify Admin Dashboard (Real-time)
    this.eventsGateway.notifyServiceRequest({
      requestId: savedRequest.id,
      roomNumber: booking.room.number,
      guestName: booking.guest.name,
      type: savedRequest.type,
      priority: savedRequest.priority, // Admin sees RED if High
      description: savedRequest.description,
      sentiment: sentimentAnalysis,
      timestamp: new Date(),
    });

    return {
      message: 'Request received',
      status: 'OPEN',
      priority: priority, // Send back to user so they know we took it seriously
      estimatedWait: priority === 'HIGH' ? '5 mins (Priority)' : '15 mins',
    };
  }

  async findAll() {
    return this.reqRepo.find({
      relations: ['booking', 'booking.room'],
      order: { createdAt: 'DESC' },
    });
  }
}