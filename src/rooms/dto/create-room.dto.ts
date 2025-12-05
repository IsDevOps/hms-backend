import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsUrl } from 'class-validator';
import { RoomType, RoomStatus } from '../entities/room.entity'; // Adjust path if needed

export class CreateRoomDto {
  @ApiProperty({ example: '101', description: 'The unique room number' })
  @IsString()
  number: string;

  @ApiProperty({
    enum: RoomType,
    example: RoomType.SINGLE,
    description: 'Type of room',
  })
  @IsEnum(RoomType)
  type: RoomType;

  @ApiProperty({ example: 150.0, description: 'Price per night' })
  @IsNumber()
  price: number;

  @ApiProperty({
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    description: 'Current status',
  })
  @IsEnum(RoomStatus)
  @IsOptional()
  status: RoomStatus;

  @ApiProperty({
    example: 'https://example.com/room.jpg',
    description: 'URL to room image',
  })
  @IsUrl()
  @IsOptional()
  imageUrl: string;
}
