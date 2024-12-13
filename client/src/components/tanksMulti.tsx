import React, { Component } from 'react';
import Phaser from 'phaser';
import bullet from "../assets/bullet.png"
import tank from "../assets/tank.png"

interface IShootKeys {
    w: Phaser.Input.Keyboard.Key;
    o: Phaser.Input.Keyboard.Key;
}

// interface IPlayerInfo extends Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
//     rotateWay?: boolean; 
//     userMoving?: boolean; 
//     shootKey?: Phaser.Input.Keyboard.Key; 
// }

const speed = 150;
const rotationSpeed = 3;

class Player extends Phaser.Physics.Arcade.Image {
    public rotateWay: boolean;
    public userMoving: boolean;
    public shootKey: Phaser.Input.Keyboard.Key;
    public lastFired: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, shootKey: Phaser.Input.Keyboard.Key) {
        super(scene, x, y, texture);

        scene.physics.world.enable(this);
        scene.add.existing(this);

        // Настройки игрока
        this.setScale(0.15);
        this.setOrigin(0.5, 0.5);
        this.setCollideWorldBounds();
        this.setBounce(1);

        this.rotateWay = false;
        this.userMoving = false;
        this.shootKey = shootKey;




    }

    update(shootBullet: (player: Player) => void) {
        if (this.shootKey.isDown) {
            const angleRad = Phaser.Math.DegToRad(this.angle);
            const velocityX = Math.cos(angleRad) * speed;
            const velocityY = Math.sin(angleRad) * speed;

            this.setVelocity(velocityX, velocityY);
            shootBullet(this, velocityX, velocityY);



            this.userMoving = true;
        } else {
            this.userMoving = false;
            this.setVelocity(0);

            if (this.rotateWay) {
                this.angle -= rotationSpeed;
            } else {
                this.angle += rotationSpeed;
            }



        }


        const halfWidth = this.displayWidth / 2;
        const halfHeight = this.displayHeight / 2;

        // Ограничиваем движение по оси X
        if (this.x < halfWidth) this.x = halfWidth;
        if (this.x > this.scene.game.config.width - halfWidth) this.x = this.scene.game.config.width - halfWidth;

        // Ограничиваем движение по оси Y
        if (this.y < halfHeight) this.y = halfHeight;
        if (this.y > this.scene.game.config.height - halfHeight) this.y = this.scene.game.config.height - halfHeight;

    }

}




class GameScene extends Phaser.Scene {
    private shootKeys!: IShootKeys;
    private playerGroup!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private objs!: Phaser.Physics.Arcade.Group;


    constructor(
    ) {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('player', tank);
        this.load.image('otherPlayer', tank);
        this.load.image('bullet', bullet);

        this.load.image('obj');

        // ______________

        this.load.image('cubeTileset', 'path/to/tileset.png');
        this.load.tilemapTiledJSON('cubeMap', 'path/to/cube_map.json');

    }

    create() {






        this.physics.world.setBounds(0, 0, 800, 600);
        this.playerGroup = this.physics.add.group();

        this.shootKeys = {
            w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            o: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.O),

        }


        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 1000,
        });


        this.objs = this.physics.add.group({
            defaultKey: 'objs',
            maxSize: 100,
        });

        this.physics.add.collider(this.playerGroup, this.playerGroup, (player1, player2) => {
            console.log('Игроки столкнулись!');
        });

        this.physics.add.collider(this.playerGroup, this.objs, (player, obj) => {
            console.log('Игрок столкнулся с объектом!');
            // Останавливаем игрока при столкновении

        });

        this.physics.add.collider(this.bullets, this.playerGroup, (bullet, player) => {
            const shooter = (bullet as any).shooter;

            if (shooter !== player) {
                bullet.destroy();
                player.destroy();

                setTimeout(() => {
                    this.restartGame();
                }, 1000);
            }
        });

        this.physics.add.collider(this.bullets, this.objs, (bullet, obj) => {
            // obj.destroy();
            bullet.destroy();

        })



        this.spawnPlayer(100, 300, 'player', 'w');
        this.spawnPlayer(700, 400, 'player', 'o');

        this.spawnObjects()
    }

    spawnPlayer(x: number, y: number, texture: string, shootKey: keyof IShootKeys): void {
        const player = new Player(this, x, y, texture, this.shootKeys[shootKey]);

        if (!this.playerGroup) {
            this.playerGroup = this.physics.add.group();
        }
        this.playerGroup.add(player);
    }

    spawnObjects() {
        for (let i = 0; i < this.randInt(5, 10); i++) {
            const obj = this.objs.get(this.randInt(100, 700), this.randInt(100, 500)).setScale(1);
            obj.setCollideWorldBounds(true);
            obj.setBounce(1);
            obj.setVelocity(0, 0);
            obj.setActive(true);
            obj.setImmovable(true); // Объект не двигается при столкновении
        }
    }


    randInt(min: number, max: number) {
        return Phaser.Math.Between(min, max);

    }

    restartGame() {
        this.scene.restart()
    }



    shootBullet(player: Player, velocityX: number, velocityY: number) {

        if (player.userMoving) return

        player.setVelocityX(-velocityX * 2.5)
        player.setVelocityY(-velocityY * 2.5)

        console.log('change way')
        player.rotateWay = !(player.rotateWay)

        const now = this.time.now;

        if (now - player.lastFired < 500) return;

        const bullet = this.bullets.get(player.x, player.y).setScale(0.5);

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setDepth(-1);

            bullet.body.reset(player.x, player.y);

            const angleRad = Phaser.Math.DegToRad(player.angle);
            const velocityX = Math.cos(angleRad) * 400;
            const velocityY = Math.sin(angleRad) * 400;

            bullet.body.velocity.x = velocityX;
            bullet.body.velocity.y = velocityY;

            const angleDeg = Phaser.Math.RadToDeg(Math.atan2(velocityY, velocityX));
            bullet.setRotation(angleRad);
            bullet.angle = angleDeg;

            (bullet as any).shooter = player;

            player.lastFired = now;
        }
    }


    update() {

        this.playerGroup.getChildren().forEach((item) => {
            const player = item as Player;
            player.update(this.shootBullet.bind(this));
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
            fps: { limit: 100 },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: true
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