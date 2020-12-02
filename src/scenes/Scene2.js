import Phaser from 'phaser'
import Beam from './beam1.js'
import Explosion from './explosion'

const gameSettings = {
    playerSpeed: 200
}

export default class Scene2 extends Phaser.Scene {
    constructor() {
        super('playGame')
    }

    create() {


        this.score = 0;

        this.background = this.add.tileSprite(0,0, this.scale.width, this.scale.height, 'background');
        this.background.setOrigin(0,0);

        // this.add.text(20, 20, 'PLAYING GAME', {font: "25px Arial", fill: "yellow"});

        this.ship1 = this.add.sprite(this.scale.width/2 -50, this.scale.height/2, 'ship');
        this.ship2 = this.add.sprite(this.scale.width/2, this.scale.height/2, 'ship2');
        this.ship3 = this.add.sprite(this.scale.width/2 +50, this.scale.height/2, 'ship3');

        this.ship1.play("ship1_anim")
        this.ship2.play("ship2_anim")
        this.ship3.play("ship3_anim")
        // this.exlp.play("explosion")

        this.ship1.setInteractive();
        this.ship2.setInteractive();
        this.ship3.setInteractive();

        this.input.on('gameobjectdown', this.destroyShip, this);

        this.powerUps = this.physics.add.group();

        let maxObjets = 4;

        for (let i =0; i<maxObjets; i++) {
            let powerUp = this.physics.add.sprite(16,16, 'power-up');
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, this.scale.width, this.scale.height);

            if (Math.random() > 0.5){
                powerUp.play('red')
            } else {
                powerUp.play('gray')
            }

            powerUp.setVelocity(100, 100);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);

            this.beamSound = this.sound.add('audio_beam');
            this.explosionSound = this.sound.add('audio_explosion');
            this.pickupSound = this.sound.add('audio_pickup');

            this.music = this.sound.add('music');

            let musicConfig = {
                mute: false,
                volume: 1,
                rate: 1,
                detune: 0,
                seek: 0,
                loop: false,
                delay: 0
            }

            this.music.play(musicConfig);
        }

        this.player = this.physics.add.sprite(this.scale.width /2 - 8 , this.scale.height - 64, 'player')
        this.player.play('thrust');
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.player.setCollideWorldBounds(true);

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        this.projectiles = this.add.group();

        this.physics.add.collider(this.projectiles, this.powerUps, function(projectile, powerup){
            projectile.destroy()
        });

        this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

        this.enemies = this.physics.add.group();
        this.enemies.add(this.ship1);
        this.enemies.add(this.ship2);
        this.enemies.add(this.ship3);

        this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);


        let graphics = this.add.graphics();
        graphics.fillStyle("Black");
        graphics.fillRect(0,0,this.scale.width,20);


        this.scoreLabel = this.add.bitmapText(10, 5, 'pixelfont', 'SCORE', 16)

    }

    hitEnemy(projectile, enemy){
        let explosion = new Explosion(this, enemy.x, enemy.y);

        projectile.destroy();
        this.resetShipPos(enemy);
        this.score += 15;
        let scoreFormat = this.zeroPad(this.score, 6);

        this.scoreLabel.text = "SCORE " + scoreFormat;

        this.explosionSound.play();
    }

    zeroPad(number, size) {
        let stringNumber = String(number);
        while (stringNumber.length < (size || 2)){
            stringNumber = '0' + stringNumber;
        }

        return stringNumber;
    }

    hurtPlayer(player, enemy){
        this.resetShipPos(enemy);
        // player.x = this.scale.width/2-8;
        // player.y = this.scale.height - 64;

        if(this.player.alpha < 1){
            return;
        }

        let explosion = new Explosion(this, player.x, player.y);
        player.disableBody(true,true);

        this.time.addEvent({
            delay: 1000,
            callback: this.resetPlayer,
            callbackScope: this,
            loop: false
        })

    }

    resetPlayer(){
        this.player.enableBody(true, this.scale.width/2-8, this.scale.height - 64, true, true)     
        this.player.alpha = 0.5; 

        let tween = this.tweens.add({
            targets: this.player,
            y: this.scale.height - 64,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function(){
                this.player.alpha = 1;
            },
            callbackScope: this
        })
    }

    moveShip(ship, speed) {
        ship.y += speed;

        if(ship.y > this.scale.height) {
            this.resetShipPos(ship);
        }
    }
    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true,true)
        this.pickupSound.play();
    }

    destroyShip(pointer, gameObject) {
        gameObject.setTexture('explosion');
        gameObject.play('explosion')
    }

    resetShipPos(ship) {
        ship.y =0;
        let randomX = Phaser.Math.Between(0, this.scale.width);
        ship.x = randomX;
    }

    movePlayerManager() {
        if (this.cursorKeys.left.isDown){
            this.player.setVelocityX(-gameSettings.playerSpeed);
        } else if (this.cursorKeys.right.isDown){
            this.player.setVelocityX(gameSettings.playerSpeed)
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursorKeys.up.isDown){
            this.player.setVelocityY(-gameSettings.playerSpeed);
        } else if (this.cursorKeys.down.isDown){
            this.player.setVelocityY(gameSettings.playerSpeed)
        } else {
            this.player.setVelocityY(0);
        }
    }

    shootBeam(){
        let beam = new Beam(this);
        this.beamSound.play();
    }
    update(){
        this.moveShip(this.ship1, 1);
        this.moveShip(this.ship2, 2);
        this.moveShip(this.ship3, 3);

        this.background.tilePositionY -=0.5;

        this.movePlayerManager();

        if (Phaser.Input.Keyboard.JustDown(this.spacebar)){
            if(this.player.active) {
                this.shootBeam();
            };
        }

        for (let i =0; i < this.projectiles.getChildren().length; i++){
            let beam = this.projectiles.getChildren()[i];
            beam.update();
        }
    }
}