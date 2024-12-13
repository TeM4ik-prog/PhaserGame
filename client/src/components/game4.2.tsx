import React, { Component } from 'react';
import Phaser from 'phaser';
import { io } from 'socket.io-client';
import bullet from "../assets/bullet.png"
import tank from "../assets/tank.png"

const socket = io('http://localhost:3000');

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.players = {};
        this.bullets = [];
        this.lastFired = 0;
        this.mooving = false;
        this.rotateWay = false;

        this.isShooting = false;

        this.objs = []
    }

    preload() {
        this.load.image('localPlayer', tank);
        this.load.image('otherPlayer', tank);
        this.load.image('bullet', bullet);

        this.load.image('obj');

    }

    create() {
        this.physics.world.setBounds(0, 0, 800, 600);


        // this.localPlayer = this.add.rectangle(400, 300, 30, 20, 0xff0000);


        this.localPlayer = this.physics.add.image(400, 300, 'localPlayer').setScale(0.15)
        this.localPlayer.setOrigin(0.5, 0.5);

        this.physics.add.existing(this.localPlayer);
        this.localPlayer.angle = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        this.playerGroup = this.physics.add.group();
        this.playerGroup.add(this.localPlayer);

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 100,
        });


        this.objs = this.physics.add.group({
            defaultKey: 'objs',
            maxSize: 100,
        });

        this.input.on('pointerdown', () => {
            this.isShooting = true; // Устанавливаем флаг при нажатии
            // this.handleShooting();
        });

        this.input.on('pointerup', () => {
            this.isShooting = false; // Сбрасываем флаг, когда нажимание прекращается
        });


        this.physics.add.collider(this.localPlayer, this.playerGroup, this.handleCollision, null, this);

        this.updatePlayers();
        this.setupBullets();


        this.spawnObjects()
    }

    handleCollision(localPlayer, otherPlayer) {
        if (localPlayer === otherPlayer) return;
        console.log('Collision detected with another player');
    }

    spawnObjects() {
        for (let i = 0; i < this.randInt(5, 10); i++) {
            const obj = this.objs.get(this.randInt(100, 700), this.randInt(100, 500)).setScale(0.5);

            obj.setActive(true)
            obj.setImmovable(true);

            this.physics.add.collider(this.objs, this.bullets, (obj, bullet) => {
                obj.destroy();
                // obj.setActive(false)
                bullet.destroy();
                console.log('Объект и пуля удалены');

                console.log(this.objs.countActive(true))

                if (this.objs.countActive(true) == 0) {
                    this.spawnObjects();
                }

            });
        }
    }


    randInt(min: number, max: number) {
        return Phaser.Math.Between(min, max);

    }



    shootBullet(mooving) {
        if (mooving) return;
        this.rotateWay = !this.rotateWay;

        const now = this.time.now;

        if (now - this.lastFired < 100) return;

        const bullet = this.bullets.get(this.localPlayer.x, this.localPlayer.y).setScale(0.5);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setDepth(-1);

            bullet.body.reset(this.localPlayer.x, this.localPlayer.y);

            const angleRad = Phaser.Math.DegToRad(this.localPlayer.angle);
            const velocityX = Math.cos(angleRad) * 400;
            const velocityY = Math.sin(angleRad) * 400;

            bullet.body.velocity.x = velocityX;
            bullet.body.velocity.y = velocityY;

            // Устанавливаем угол пули по направлению её скорости
            const angleDeg = Phaser.Math.RadToDeg(Math.atan2(velocityY, velocityX));
            bullet.setRotation(angleRad); // Если нужна ориентация по радианам
            bullet.angle = angleDeg;     // Если нужна ориентация в градусах

            this.lastFired = now;

            // socket.emit('shootBullet', {
            //     x: bullet.x,
            //     y: bullet.y,
            //     velocityX: bullet.body.velocity.x,
            //     velocityY: bullet.body.velocity.y,
            // });
        }
    }

    setupBullets() {
        socket.on('updateBullets', (data) => {
            console.log('Bullets received:', data.bullets);

            // Очищаем существующие пули перед рендерингом новых
            this.bullets.clear(true, true);

            data.bullets.forEach((bullet) => {
                const newBullet = this.bullets.create(bullet.x, bullet.y, 'bullet');
                newBullet.body.setVelocity(bullet.velocityX, bullet.velocityY);
                newBullet.setScale(0.65);
                newBullet.setActive(true);
                newBullet.setVisible(true);

                newBullet.angle = Phaser.Math.RadToDeg(Math.atan2(bullet.velocityY, bullet.velocityX));
            });
        });
    }


    updatePlayers() {
        socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((id) => {
                const player = players[id];
                // console.log(player)
                if (id === socket.id) {
                    this.localPlayer.setPosition(player.x, player.y);

                } else {
                    if (!this.players[id]) {
                        const newPlayer = this.add.rectangle(player.x, player.y, 30, 20, 0x0000ff);
                        newPlayer.setOrigin(0.5, 0.5);


                        // this.newPlayer.angle = player.angle; 


                        this.playerGroup.add(newPlayer);
                        this.players[id] = newPlayer;
                    } else {
                        this.players[id].setPosition(player.x, player.y);
                        this.players[id].angle = player.angle;
                    }
                }
            });

            Object.keys(this.players).forEach((id) => {
                if (!players[id]) {
                    this.players[id].destroy();
                    delete this.players[id];
                }
            });
        });
    }

    update() {
        const speed = 1;
        const rotationSpeed = 1;
        let moved = false;

        if (this.shootKey.isDown || this.isShooting) {
            moved = true;
            const angleRad = Phaser.Math.DegToRad(this.localPlayer.angle);

            this.localPlayer.x += Math.cos(angleRad) * speed;
            this.localPlayer.y += Math.sin(angleRad) * speed;

            this.shootBullet(this.mooving);
            this.mooving = true;

        } else {
            this.mooving = false;
            if (this.rotateWay) {
                this.localPlayer.angle -= rotationSpeed;
            } else {
                this.localPlayer.angle += rotationSpeed;
            }
        }

        // if (moved) {
        const bounds = this.physics.world.bounds;
        this.localPlayer.x = Phaser.Math.Clamp(this.localPlayer.x, bounds.left + 10, bounds.right - 10);
        this.localPlayer.y = Phaser.Math.Clamp(this.localPlayer.y, bounds.top + 10, bounds.bottom - 10);

        socket.emit('playerMove', { x: this.localPlayer.x, y: this.localPlayer.y, angle: this.localPlayer.angle });
        // }

        this.bullets.children.each((bullet) => {
            if (bullet.active) {
                if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                    bullet.body.setVelocity(0);
                }
            }
        });
    }
}

class Game extends Component {
    constructor() {
        super();
        this.gameRef = null;
    }

    componentDidMount() {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            fps: { limit: 240 },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                },
            },
            scene: [GameScene],
        };

        this.gameRef = new Phaser.Game(config);
    }

    componentWillUnmount() {
        if (this.gameRef) {
            this.gameRef.destroy(true);
        }
    }

    render() {
        return <div id="phaser-container" />;
    }
}

export { Game };