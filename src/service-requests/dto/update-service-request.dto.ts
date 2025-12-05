import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServiceRequestDto } from './create-service-request.dto';
import { RequestStatus } from '../entities/service-request.entity';
import { IsEnum } from 'class-validator';

export class UpdateServiceRequestDto extends PartialType(CreateServiceRequestDto) {}


export class UpdateServiceStatusRequestDto {
    @ApiProperty({
        description: 'The new status of the service request',
        example: RequestStatus.IN_PROGRESS,
    })
    @IsEnum(RequestStatus)
    status: RequestStatus;
}