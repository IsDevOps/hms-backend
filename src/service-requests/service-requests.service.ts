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
import { ServiceRequest, Priority, RequestStatus, ServiceType } from './entities/service-request.entity';
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
      status: RequestStatus.RECEIVED,
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

  // async findAll() {
  //   return this.reqRepo.find({
  //     relations: ['booking', 'booking.room'],
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  // async updateStatus(id: string, status: RequestStatus) {
  //   const request = await this.reqRepo.findOne({
  //     where: { id },
  //     relations: ['booking', 'booking.room'],
  //   });

  //   if (!request) throw new NotFoundException('Request not found');

  //   request.status = status;
  //   await this.reqRepo.save(request);

  //   // 📡 Notify the specific Guest (Real-time Tracker)
  //   // We emit an event that the frontend listens to: 'status-update:BOOKING_ID'
  //   this.eventsGateway.server.emit(`status-update:${request.booking.id}`, {
  //     requestId: request.id,
  //     newStatus: status,
  //     message: this.getStatusMessage(status),
  //   });

  //   return request;
  // }

  // private getStatusMessage(status: RequestStatus): string {
  //   switch (status) {
  //     case RequestStatus.IN_PROGRESS:
  //       return 'Chef is cooking / Staff is working';
  //     case RequestStatus.ON_WAY:
  //       return 'Staff is on the way to your room';
  //     case RequestStatus.COMPLETED:
  //       return 'Service completed. Enjoy!';
  //     default:
  //       return 'Request received';
  //   }
  // }

  // 👇 NEW METHOD 👇
  async updateStatus(id: string, status: RequestStatus) {
    // 1. Find the Request (and load the Booking to get the Guest's ID)
    const request = await this.reqRepo.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!request) {
      throw new NotFoundException(`Service Request ${id} not found`);
    }

    // 2. Update the DB
    request.status = status;
    const updatedRequest = await this.reqRepo.save(request);

    // 3. 📡 TARGETED NOTIFICATION (The "Domino's Tracker" Event)
    // We send this ONLY to the specific Booking ID channel.
    // The Frontend Guest App must listen to: `status-update:${bookingId}`
    const eventName = `status-update:${request.booking.id}`;
    const message = this.getStatusMessage(status);

    this.eventsGateway.server.emit(eventName, {
      requestId: request.id,
      newStatus: status,
      message: message,
      timestamp: new Date(),
    });

    this.logger.log(`📢 Emitted '${eventName}' -> Status: ${status}`);

    return {
      success: true,
      status: status,
      message: message,
    };
  }

  // Helper to give friendly messages to the guest
  private getStatusMessage(status: RequestStatus): string {
    switch (status) {
      case RequestStatus.RECEIVED:
        return 'We have received your request.';
      case RequestStatus.IN_PROGRESS:
        return 'Staff is working on your request.';
      case RequestStatus.ON_WAY:
        return 'Staff is on the way to your room.';
      case RequestStatus.COMPLETED:
        return 'Service completed. Have a great stay!';
      case RequestStatus.CANCELLED:
        return 'Request was cancelled.';
      default:
        return 'Status updated.';
    }
  }

  async getRecommendation(bookingId: string) {
    // 1. Get History (Mocked logic for Hackathon)
    // In a real app, you'd fetch: this.reqRepo.find({ where: { booking: { id: bookingId } } })

    // 2. Hackathon Logic: Check time of day
    const hour = new Date().getHours();
    let context = 'Afternoon';
    if (hour < 11) context = 'Morning';
    else if (hour > 18) context = 'Evening';

    // 3. Ask AI
    const prompt = `
      Context: It is ${context}. The guest is in a Hotel.
      Task: Suggest ONE service or food item they might want right now.
      Return JSON: { "suggestion": "Coffee", "reason": "It is morning." }
    `;

    // Call your AI Service here (create a method for generic prompts if needed)
    // const aiRes = await this.aiService.ask(prompt);

    // OR Mock it for speed:
    if (context === 'Morning')
      return {
        suggestion: 'Cappuccino & Bagel',
        reason: 'Start your day fresh!',
      };
    if (context === 'Evening')
      return {
        suggestion: 'Relaxing Spa Towels',
        reason: 'Unwind after a long day.',
      };
    return { suggestion: 'Club Sandwich', reason: 'Perfect for lunch.' };
  }

  async findAll(type?: ServiceType) {
    const queryOptions: any = {
      relations: ['booking', 'booking.room', 'booking.guest'], // Added guest so you see who asked
      order: { createdAt: 'DESC' },
    };

    // If a type is provided (and it's not empty/null), add the WHERE clause
    if (type) {
      queryOptions.where = { type: type };
    }

    return this.reqRepo.find(queryOptions);
  }
}