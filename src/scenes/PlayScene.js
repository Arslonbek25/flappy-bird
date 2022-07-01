import Phaser from "phaser";

class PlayScene extends Phaser.Scene {
	constructor(config) {
		super("PlayScene");
		this.config = config;
		this.initialBirdPos = { x: 80, y: 300 };
		this.bird = null;
		this.pipes = null;
		this.flapVelocity = 350;
		this.pipesToRender = 4;
		this.gravity = 800;
		this.pipeOpeningRange = [100, 250];
		this.pipeDistanceRange = [400, 450];
		this.initialBirdPos = {
			x: config.width / 10,
			y: config.height / 2,
		};
	}

	preload() {
		this.load.image("sky", "assets/sky.png");
		this.load.image("bird", "assets/bird.png");
		this.load.image("pipe", "assets/pipe.png");
	}

	create() {
		this.createBG();
		this.createBird();
		this.createPipes();
		this.createColliders();
		this.handleInputs();
	}

	update() {
		this.recyclePipes();
		this.checkGameStatus();
	}

	createColliders() {
		this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
	}

	checkGameStatus() {
		if (this.bird.getBounds().bottom > this.config.height - this.bird.height / 2 || this.bird.y <= 0) {
			this.gameOver();
		}
	}

	createBG() {
		this.add.image(0, 0, "sky").setOrigin(0);
	}

	createBird() {
		this.bird = this.physics.add
			.sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
			.setOrigin(0);
		this.bird.body.gravity.y = this.gravity;
		this.bird.setCollideWorldBounds;
	}

	createPipes() {
		this.pipes = this.physics.add.group();
		for (let i = 0; i < this.pipesToRender; i++) {
			const upperPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0, 1);
			const lowerPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0);

			this.placePipe(upperPipe, lowerPipe);
		}
		this.pipes.setVelocityX(-200);
	}

	handleInputs() {
		this.input.on("pointerdown", this.flap, this);
		this.input.keyboard.on("keydown_SPACE", this.flap, this);
	}

	placePipe(uPipe, lPipe) {
		const rightMostX = this.getRightMostPipe();
		const pipeOffset = Phaser.Math.Between(...this.pipeOpeningRange);
		const pipeYPos = Phaser.Math.Between(20, this.config.height - pipeOffset - 20);
		const pipeDistance = Phaser.Math.Between(...this.pipeDistanceRange);

		uPipe.x = rightMostX + pipeDistance;
		uPipe.y = pipeYPos;

		lPipe.x = uPipe.x;
		lPipe.y = uPipe.y + pipeOffset;
	}

	recyclePipes() {
		let pipesToMove = [];

		this.pipes.getChildren().forEach(pipe => {
			if (pipe.getBounds().right <= 0) pipesToMove.push(pipe);
		});

		if (pipesToMove.length) {
			this.placePipe(...pipesToMove);
			pipesToMove = [];
		}
	}

	getRightMostPipe() {
		let rightMostX = 0;

		this.pipes.getChildren().forEach(function (pipe) {
			rightMostX = Math.max(pipe.x, rightMostX);
		});

		return rightMostX;
	}

	gameOver() {
		this.physics.pause();
		this.bird.setTint(0xff0000);
		this.time.addEvent({
			delay: 1000,
			loop: false,
			callback: () => {
				this.scene.restart();
			},
		});
	}

	flap() {
		this.bird.body.velocity.y = -this.flapVelocity;
	}
}

export default PlayScene;
