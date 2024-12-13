import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import ballI from '../assets/ball2.png';

import platformV from "../assets/platformV.png"
import platformH from "../assets/platformH.png"

const Game: React.FC = () => {
    const gameContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: gameContainer.current || undefined,
            width: 800,
            height: 600,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                },
                
            },
            scene: {
                preload,
                create,
                update,
            },
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    return <div ref={gameContainer} style={{ width: '100%', height: '100%' }} />;
};

export { Game };

// Game logic
let ball: Phaser.Physics.Arcade.Sprite;
let player1: Phaser.Physics.Arcade.Sprite;
let player2: Phaser.Physics.Arcade.Sprite;
let player3: Phaser.Physics.Arcade.Sprite;
let player4: Phaser.Physics.Arcade.Sprite;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let wKey: Phaser.Input.Keyboard.Key;
let sKey: Phaser.Input.Keyboard.Key;
let iKey: Phaser.Input.Keyboard.Key;
let kKey: Phaser.Input.Keyboard.Key;

function preload(this: Phaser.Scene) {
    this.load.image('ball', ballI);
    this.load.image('paddleV', platformV);
    this.load.image('paddleH', platformH);
}

function create(this: Phaser.Scene) {
    this.physics.world.setBoundsCollision(true, true, true, true);

    ball = this.physics.add.sprite(400, 300, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(1);
    ball.setVelocity(200, 200);

    ball.body.onWorldBounds = true; 

    player1 = this.physics.add.sprite(50, 300, 'paddleV').setScale(0.25);
    player1.setImmovable(true);

    player2 = this.physics.add.sprite(750, 300, 'paddleV').setScale(0.25);
    player2.setImmovable(true);


    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);

    // player3 = this.physics.add.sprite(400, 50, 'paddleH').setScale(0.25);
    // player3.setImmovable(true);

    // player4 = this.physics.add.sprite(400, 550, 'paddleH').setScale(0.25);
    // player4.setImmovable(true);

    this.physics.add.collider(ball, player1);
    this.physics.add.collider(ball, player2);
    // this.physics.add.collider(ball, player3);
    // this.physics.add.collider(ball, player4);


    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    // player3.setCollideWorldBounds(true);
    // player4.setCollideWorldBounds(true);


    


    cursors = this.input.keyboard.createCursorKeys();
    wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    // iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    // kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);




    // Включаем событие worldbounds
    this.physics.world.addListener('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
        
        if (body.gameObject === ball) {
            if (ball.x < 0) {
                console.log('Player 1 loses!');
                this.scene.restart();
            }
            if (ball.x > 800) {
                console.log('Player 2 loses!');
                this.scene.restart();
            }
        }
    });
    
}

function update(this: Phaser.Scene) {
    if (wKey.isDown) {
        player1.setVelocityY(-300);
    } else if (sKey.isDown) {
        player1.setVelocityY(300);
    } else {
        player1.setVelocityY(0);
    }

    if (cursors.up.isDown) {
        player2.setVelocityY(-300);
    } else if (cursors.down.isDown) {
        player2.setVelocityY(300);
    } else {
        player2.setVelocityY(0);
    }

    // if (iKey.isDown) {
    //     player3.setVelocityX(-300);
    // } else if (kKey.isDown) {
    //     player3.setVelocityX(300);
    // } else {
    //     player3.setVelocityX(0);
    // }

    // if (cursors.left.isDown) {
    //     player4.setVelocityX(-300);
    // } else if (cursors.right.isDown) {
    //     player4.setVelocityX(300);
    // } else {
    //     player4.setVelocityX(0);
    // }
}
