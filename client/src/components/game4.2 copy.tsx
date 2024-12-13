import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import ballI from '../assets/ball2.png';
import platformV from '../assets/platformV.png';
import { io, Socket } from 'socket.io-client';


// https://bgdh2765-3000.euw.devtunnels.ms/
const socket: Socket = io('http://localhost:3000/');
let isUpdateEnabled = true;

export const Game: React.FC = () => {
    const gameContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameContainer.current || undefined,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: { debug: false },
            },
            scene: [GameScene],
        };

        const game = new Phaser.Game(config);

        return () => {
            socket.disconnect();
            game.destroy(true);
        };
    }, []);

    return (
        <>
            <div ref={gameContainer} style={{ width: '100%', height: '100%' }} />
            <button onClick={() => (isUpdateEnabled = !isUpdateEnabled)}>
                {isUpdateEnabled ? 'Отправляется' : 'Не отправляется'}
            </button>
        </>
    );
};



class GameScene extends Phaser.Scene {
    private ball!: Phaser.Physics.Arcade.Sprite;
    private player1!: Phaser.Physics.Arcade.Sprite;
    private player2!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wKey!: Phaser.Input.Keyboard.Key;
    private sKey!: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('ball', ballI);
        this.load.image('paddleV', platformV);
    }

    create() {
        this.physics.world.setBoundsCollision(true, true, true, true);

        socket.emit('requestGameState');
        socket.on('ballPosition', (data) => this.createOrUpdateBall(data));

        this.createPlayers();
        this.setupKeyboard();
    }

    update() {
        if (!isUpdateEnabled) return;

        // if (this.wKey.isDown) {
        //     this.movePlayer(this.player1, -300);
        //     socket.emit('playerMove', { player: 'player1', y: this.player1.y });
        // } else if (this.sKey.isDown) {
        //     this.movePlayer(this.player1, 300);
        //     socket.emit('playerMove', { player: 'player1', y: this.player1.y });
        // } else {
        //     this.player1.setVelocityY(0);
        // }

        // if (this.cursors.up.isDown) {
        //     this.movePlayer(this.player2, -300);
        //     socket.emit('playerMove', { player: 'player2', y: this.player2.y });
        // } else if (this.cursors.down.isDown) {
        //     this.movePlayer(this.player2, 300);
        //     socket.emit('playerMove', { player: 'player2', y: this.player2.y });
        // } else {
        //     this.player2.setVelocityY(0);
        // }
    }

    private createOrUpdateBall(data: { x: number; y: number }) {
        if (!this.ball) {
            this.ball = this.physics.add.sprite(data.x, data.y, 'ball').setBounce(1).setCollideWorldBounds(true);
        } else {
            this.ball.setPosition(data.x, data.y);
        }
    }

    private createPlayers() {
        this.player1 = this.physics.add.sprite(50, 300, 'paddleV').setScale(0.25).setImmovable(true);
        this.player2 = this.physics.add.sprite(750, 300, 'paddleV').setScale(0.25).setImmovable(true);

        this.player1.setCollideWorldBounds(true);
        this.player2.setCollideWorldBounds(true);

        this.physics.add.collider(this.ball, this.player1, () => this.handlePlayerHit());
        this.physics.add.collider(this.ball, this.player2, () => this.handlePlayerHit());
    }

    private setupKeyboard() {
        const keyboard = this.input.keyboard!;
        this.cursors = keyboard.createCursorKeys();
        this.wKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    }

    private movePlayer(player: Phaser.Physics.Arcade.Sprite, velocity: number) {
        player.setVelocityY(velocity);
    }

    private handlePlayerHit() {
        const speedMultiplier = 1.1;
        this.ball.setVelocity(
            this.ball.body.velocity.x * speedMultiplier,
            this.ball.body.velocity.y * speedMultiplier
        );
    }
}

