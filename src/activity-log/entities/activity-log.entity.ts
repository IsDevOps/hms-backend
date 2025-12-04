import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string; 

  @Column()
  type: string; // "BOOKING", "ALERT", "SERVICE"

  @CreateDateColumn()
  timestamp: Date;
}
