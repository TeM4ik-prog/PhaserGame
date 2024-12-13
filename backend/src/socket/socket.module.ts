import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { GameGateway } from './socket.gateway';

@Module({
  providers: [GameGateway],
})
export class SocketModule {}
