import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEmail } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'John Doe', description: 'Name on the ID' })
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the Room',
  })
  @IsUUID()
  roomId: string;

  @ApiProperty({ example: '2023-12-25', description: 'ISO Date String' })
  @IsString()
  checkInDate: string;

  @ApiProperty({ example: '2023-12-28', description: 'ISO Date String' })
  @IsString()
  checkOutDate: string;

}
