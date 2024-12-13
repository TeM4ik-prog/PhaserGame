// import React, { useEffect } from 'react';
// import Phaser from 'phaser';

// import player from "../assets/ball.png"

// import React, { useEffect } from 'react';
// import Phaser from 'phaser';

// const Game: React.FC = () => {
//   useEffect(() => {
//     const config: Phaser.Types.Core.GameConfig = {
//       type: Phaser.AUTO,
//       width: 800,
//       height: 600,
//       scene: {
//         preload: preload,
//         create: create,
//         update: update
//       },
//       physics: {
//         default: 'arcade',
//         arcade: {
//           gravity: { y: 0 },
//           debug: true
//         }
//       }
//     };

//     const game = new Phaser.Game(config);

//     let balls: Phaser.Physics.Arcade.Image[] = [];

//     function preload() {
//       this.load.image('ball', player); 
//     }

//     function create() {
//       // Создаем несколько шаров
//       for (let i = 0; i < 15; i++) {
//         let ball = this.physics.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(100, 500), 'ball');
//         ball.setCircle(30); // Радиус 30
//         ball.setBounce(1); // Шары будут сильно отскакивать
//         ball.setCollideWorldBounds(true); // Отскок от границ мира
//         ball.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200)); // Начальная скорость шара


//         // Добавляем шар в массив
//         balls.push(ball);
//       }

//       // Настройка столкновений между шарами
//       this.physics.add.collider(balls, balls, (ball1, ball2) => {
//         // Можно добавить эффекты или обработку после столкновения, если нужно
//       });
//     }

//     function update() {
//       // Логика игры, если нужна дополнительная обработка
//     }

//     return () => {
//       game.destroy(true);
//     };
//   }, []);

//   return <div id="game"></div>;
// };

// export default Game;
