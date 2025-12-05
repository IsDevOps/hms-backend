import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export enum ServiceType {
  FOOD = 'FOOD', // Burgers, Pasta (Room Service)
  CLEANING = 'CLEANING', // "Clean my room"
  TOWELS = 'TOWELS', // "Need 2 towels"
  MAINTENANCE = 'MAINTENANCE', // "AC is broken"
  CONCIERGE = 'CONCIERGE', // Free text: "Book a taxi", "Wake up call"
  OTHER = 'OTHER',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH', // AI sets this to HIGH if sentiment is negative/urgent
}

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @Column('text')
  description: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, IN_PROGRESS, CLOSED

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.NORMAL,
  })
  priority: Priority;

  @ManyToOne(() => Booking, (booking) => booking.requests)
  booking: Booking;

  @CreateDateColumn()
  createdAt: Date;
}
