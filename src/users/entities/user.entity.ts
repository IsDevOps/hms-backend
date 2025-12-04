import { Booking } from 'src/bookings/entities/booking.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';


export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: '123456' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @OneToMany(() => Booking, (booking) => booking.guest)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;
}
