// import React, { useEffect, useRef } from 'react';
// import Phaser from 'phaser';
// import { Client, Room } from 'colyseus.js';

// const Game: React.FC = () => {
//     const gameRef = useRef<Phaser.Game | null>(null);

//     useEffect(() => {
//         const client = new Client('ws://localhost:2567');

//         const connectToRoom = async () => {
//             const room = await client.joinOrCreate('ball_game');

//             const BallScene = new Phaser.Class({
//                 Extends: Phaser.Scene,

//                 initialize: function BallScene() {
//                     Phaser.Scene.call(this, { key: 'BallScene' });
//                 },

//                 preload: function () { },

//                 create: function () {
//                     const width = 100;
//                     const height = 100;
//                     this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
//                     this.ball = this.add.circle(50, 50, 5, 0xff0000);

//                     room.onStateChange((state: any) => {
//                         this.ball.setPosition(state.x, state.y);
//                     });
//                 },
//             });

//             const config: Phaser.Types.Core.GameConfig = {
//                 type: Phaser.AUTO,
//                 width: 500,
//                 height: 500,
//                 scene: BallScene,
//                 parent: 'phaser-container',
//                 physics: {
//                     default: 'arcade',
//                     arcade: {
//                         debug: false,
//                     },
//                 },
//             };

//             if (!gameRef.current) {
//                 gameRef.current = new Phaser.Game(config);
//             }
//         };

//         connectToRoom();

//         return () => {
//             gameRef.current?.destroy(true);
//             gameRef.current = null;
//         };
//     }, []);

//     return <div id="phaser-container" />;
// };

// export { Game };
