import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './socket.gateway';
import { SocketService } from './socket.service';

describe('SocketGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway, SocketService],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
