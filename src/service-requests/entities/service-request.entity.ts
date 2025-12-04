import { Booking } from 'src/bookings/entities/booking.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

export enum ServiceType {
  FOOD = 'FOOD',
  CLEANING = 'CLEANING',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH', // AI sets this if guest message is "angry"
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
  description: string; // "I need 3 towels" or "Burger with fries"

  @Column({ default: 'PENDING' })
  status: string; // PENDING, DONE

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
