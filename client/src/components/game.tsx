import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import player from "../assets/ball.png"

const Game: React.FC = () => {
    const gameContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            backgroundColor: '#87CEEB',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false,
                },
            },
            scene: {
                preload,
                create,
                update,
            },
            parent: gameContainer.current || undefined,
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, []);

    const preload = function (this: Phaser.Scene) {
        this.load.image('platform', 'https://labs.phaser.io/assets/sprites/platform.png');
        this.load.image('player', player);
    };

    const create = function (this: Phaser.Scene) {
        // Расширяем границы мира
        this.physics.world.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600);

        // Создаём платформы
        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 580, 'platform').setScale(2).refreshBody();
        platforms.create(600, 450, 'platform');
        platforms.create(1000, 400, 'platform');

        // Создаём игрока
        const player = this.physics.add.sprite(100, 450, 'player');
        
        // player.setCircle(25)
        // Визуальные размеры
        player.setDisplaySize(50, 50); // Можно подправить визуальные размеры, чтобы они были подходящие

        // Устанавливаем отскок
        player.setBounce(0.6); // Параметр отскока
        
        // Масса шара (можно настроить)
        player.setMass(1);
        
        // Устанавливаем коллизию с миром
        player.setCollideWorldBounds(true);






        this.physics.add.collider(player, platforms);

        // Настраиваем камеру
        this.cameras.main.startFollow(player); // Камера следует за игроком
        this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 600); // Камера может двигаться бесконечно вправо

        // Управление
        const cursors = this.input.keyboard.createCursorKeys();

        let lastPlatformX = 1000;

        this.update = () => {
            player.setVelocityX(0);

            // Управление движением
            if (cursors.left.isDown) {
                player.setVelocityX(-200);
            } else if (cursors.right.isDown) {
                player.setVelocityX(200);
            }

            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-330);
            }

            // Генерация новых платформ
            if (player.x > lastPlatformX - 400) {
                const newPlatformX = lastPlatformX + Phaser.Math.Between(200, 400);
                const newPlatformY = Phaser.Math.Between(300, 500);
                platforms.create(newPlatformX, newPlatformY, 'platform');
                lastPlatformX = newPlatformX;
            }
        };
    };

    const update = function () { };

    return <div ref={gameContainer} style={{ width: '800px', height: '600px' }} />;
};

export default Game;
