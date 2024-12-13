import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

import back from "../assets/back.png";
import plant from "../assets/plant.png";
import zombieVideo from "../assets/w.mp4";

export const Game: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 900,
            height: 600,
            parent: gameRef.current!,
            physics: {
                default: "arcade",
                arcade: { gravity: { y: 0 }, debug: false },
            },
            scene: [MainScene],
        };

        const game = new Phaser.Game(config);
        return () => game.destroy(true);
    }, []);

    return <div ref={gameRef} style={{ width: "800px", height: "600px" }} />;
};

class MainScene extends Phaser.Scene {
    grid: { x: number; y: number }[] = [];
    plants!: Phaser.Physics.Arcade.Group;
    zombies!: Phaser.GameObjects.Group;
    projectiles!: Phaser.Physics.Arcade.Group;

    cellSize = { width: 80, height: 100 };
    gridOffset = { x: 90, y: 120 };

    activeRows: Set<number> = new Set();

    preload() {
        this.load.image("plant", plant);
        this.load.image("background", back);
        this.load.video("zombie", zombieVideo);
    }

    create() {
        this.add.image(400, 300, "background").setDisplaySize(800, 600);
        this.initializeGrid();

        this.plants = this.physics.add.group();
        this.zombies = this.add.group();
        this.projectiles = this.physics.add.group();

        this.input.on("pointerdown", this.addPlant, this);

        this.time.addEvent({
            delay: 2000,
            callback: this.spawnZombie,
            callbackScope: this,
            loop: true,
        });

        this.physics.add.collider(
            this.projectiles,
            this.zombies,
            this.handleProjectileCollision,
            undefined,
            this
        );
    }

    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 9; col++) {
                const x = this.gridOffset.x + col * this.cellSize.width;
                const y = this.gridOffset.y + row * this.cellSize.height;
                this.grid.push({ x, y });
            }
        }
    }

    addPlant(pointer: Phaser.Input.Pointer) {
        const cell = this.getNearestCell(pointer.x, pointer.y);
        if (!cell) return;

        const existingPlant = this.plants.getChildren().find(
            (plant: Phaser.GameObjects.GameObject) => plant.x === cell.x && plant.y === cell.y
        );

        if (existingPlant) return;

        const plant = this.plants.create(cell.x, cell.y, "plant");
        plant.setImmovable(true);

        this.time.addEvent({
            delay: 1000,
            callback: () => this.shootProjectile(plant),
            callbackScope: this,
            loop: true,
        });
    }

    getNearestCell(x: number, y: number) {
        return this.grid.find(
            (cell) =>
                Math.abs(cell.x - x) < this.cellSize.width / 2 &&
                Math.abs(cell.y - y) < this.cellSize.height / 2
        );
    }

    shootProjectile(plant: Phaser.GameObjects.GameObject) {
        const pea = this.physics.add.image(x, y, null);
        pea.setCircle(5); // Определяем форму тела как круг
        pea.setScale(0.5);
        pea.setVelocityX(200); // Задаем скорость движения
        pea.setCollideWorldBounds(true); // Позволяем отрабатывать столкновения с границами мира
    
        // Удаляем горошину, если она выходит за пределы
        pea.body.onWorldBounds = true;
        pea.once("worldbounds", () => {
            pea.destroy();
        });
    
        this.projectiles.add(pea);
    }

    spawnZombie() {
        const row = Phaser.Math.Between(0, 4);
        const y = this.gridOffset.y + row * this.cellSize.height;
        this.activeRows.add(row);

        const zombie = this.add.video(800, y, "zombie");
        zombie.play(true);
        this.physics.add.existing(zombie);
        (zombie.body as Phaser.Physics.Arcade.Body).setVelocityX(-30);
    }

    handleProjectileCollision(projectile: Phaser.GameObjects.GameObject, zombie: Phaser.GameObjects.GameObject) {
        projectile.destroy();
        zombie.destroy();
    }
}
