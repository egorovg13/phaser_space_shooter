import Phaser from 'phaser'

import Scene1 from './scenes/Scene1'
import Scene2 from './scenes/Scene2'

// import HelloWorldScene from './scenes/HelloWorldScene'

// const config = {
// 	type: Phaser.AUTO,
// 	width: 800,
// 	height: 600,
// 	physics: {
// 		default: 'arcade',
// 		arcade: {
// 			gravity: { y: 200 }
// 		}
// 	},
// 	scene: [HelloWorldScene]
// }

// export default new Phaser.Game()

const config = {
	width: 256,
	height: 272,
	backgroundColor: 0x000000,
	scene: [Scene1, Scene2],
	physics: {
		default: 'arcade',
		arcade: {
			debug: false
		}
	}
}

const game = new Phaser.Game(config);
