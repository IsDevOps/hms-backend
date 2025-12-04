import { Booking } from 'src/bookings/entities/booking.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  SUITE = 'SUITE',
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY', // Needs cleaning
  MAINTENANCE = 'MAINTENANCE', // AI Anomaly detected (e.g., Leak)
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string; // "101", "205-B"

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.SINGLE,
  })
  type: RoomType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  // Just for the frontend UI
  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
