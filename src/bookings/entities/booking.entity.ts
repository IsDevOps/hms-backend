import { Room } from 'src/rooms/entities/room.entity';
import { ServiceRequest } from 'src/service-requests/entities/service-request.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';


export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  checkInDate: string; // Keeping as string is often easier for forms

  @Column({ type: 'date' })
  checkOutDate: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  // --- AI & SECURITY FIELDS ---
  @Column({ type: 'int', nullable: true })
  fraudScore: number; // 0 (Safe) to 100 (High Risk) - Populated by Gemini

  @Column({ type: 'text', nullable: true })
  fraudReason: string; // "IP Mismatch" or "Fake ID detected"

  @Column({ nullable: true })
  qrCodeSecret: string; // The string the Frontend converts to a QR image

  // --- RELATIONS ---
  @ManyToOne(() => User, (user) => user.bookings, { eager: true }) // eager: true loads user data automatically
  guest: User;

  @ManyToOne(() => Room, (room) => room.bookings, { eager: true })
  room: Room;

  @OneToMany(() => ServiceRequest, (req) => req.booking)
  requests: ServiceRequest[];

  @CreateDateColumn()
  createdAt: Date;
}
