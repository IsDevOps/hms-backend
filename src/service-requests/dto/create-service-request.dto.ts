import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../entities/service-request.entity'; 
export class CreateServiceRequestDto {
  @ApiProperty({
    description: 'The UUID of the active booking',
    example: 'd3b07384-d9a5-4d00-8d69-3201e527c76d',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    enum: ServiceType,
    description: 'Type of service',
    example: ServiceType.TOWELS,
  })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiProperty({
    description: 'Details (AI analyzes this for sentiment)',
    example: 'The AC is broken and I am very angry!',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 2,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
