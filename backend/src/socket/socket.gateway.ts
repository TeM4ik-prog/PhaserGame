import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface Bullet {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

interface Player {
  id: string;
  x: number;
  y: number;
  angle: number;
  bullets: Bullet[];
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private players: Record<string, Player> = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    this.players[client.id] = {
      id: client.id,
      x: 400,
      y: 300,
      angle: 0,
      bullets: [],
    };

    this.server.emit('updatePlayers', this.players);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    delete this.players[client.id];
    this.server.emit('updatePlayers', this.players);
  }

  @SubscribeMessage('playerMove')
  handlePlayerMove(client: Socket, data: { x: number; y: number; angle: number }) {
    const player = this.players[client.id];
    if (!player) return;

    player.x = data.x;
    player.y = data.y;
    player.angle = data.angle;

    this.server.emit('updatePlayers', this.players);
  }

  @SubscribeMessage('shootBullet')
  handleShootBullet(client: Socket, data: { x: number; y: number; velocityX: number; velocityY: number }) {

    const player = this.players[client.id];
    if (!player) return;

    console.log(player.bullets)

    const bullet = {
      x: data.x,
      y: data.y,
      velocityX: data.velocityX,
      velocityY: data.velocityY,
    };

    player.bullets.push(bullet);

    player.bullets = player.bullets.filter(b =>
      b.x >= 0 && b.x <= 800 && b.y >= 0 && b.y <= 600
    );

    this.server.emit('updateBullets', { id: client.id, bullets: player.bullets });
    setTimeout(() => {
      delete player.bullets[player.bullets.indexOf(bullet)]

    }, 0);
    
  }

  @SubscribeMessage('updateBullets')
  handleBulletsUpdate() {
    this.server.emit('updateBullets', Object.values(this.players).map(player => ({
      id: player.id,
      bullets: player.bullets,
    })));
  }

}
