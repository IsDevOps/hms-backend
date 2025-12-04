import { Injectable } from '@nestjs/common';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@Injectable()
export class ServiceRequestsService {
  create(createServiceRequestDto: CreateServiceRequestDto) {
    return 'This action adds a new serviceRequest';
  }

  findAll() {
    return `This action returns all serviceRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceRequest`;
  }

  update(id: number, updateServiceRequestDto: UpdateServiceRequestDto) {
    return `This action updates a #${id} serviceRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceRequest`;
  }
}
