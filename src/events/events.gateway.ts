import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', 
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`🟢 Client Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client Disconnected: ${client.id}`);
  }


  /**
   * Called when a new booking is saved in the DB.
   * Payload: { id, guestName, roomNumber, fraudScore }
   */
  notifyNewBooking(payload: any) {
    this.logger.log(
      `📢 Broadcasting 'new-booking' event for guest: ${payload.guestName}`,
    );
    this.server.emit('new-booking', payload);
  }

  /**
   * Called when AI detects high fraud score.
   * Payload: { message, reason }
   */
  notifyFraudAlert(payload: any) {
    this.logger.warn(`🚨 Broadcasting 'fraud-alert': ${payload.message}`);
    this.server.emit('fraud-alert', payload);
  }

  /**
   * Called when a guest requests a service (Towels/Food).
   */
  notifyServiceRequest(payload: any) {
    this.server.emit('service-request', payload);
  }
}
