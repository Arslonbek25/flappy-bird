import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
	constructor(config) {
		super("PlayScene", config);

		this.flapVelocity = 300;
		this.pipesToRender = 4;
		this.gravity = 800;
		this.pipeOpeningRange = [100, 250];
		this.pipeDistanceRange = [400, 450];

		this.score = 0;
		this.scoreText = "";
	}

	create() {
		super.create();
		this.createBird();
		this.createPipes();
		this.createColliders();
		this.createScore();
		this.createPause();
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
			this.increaseScore();
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

		this.saveBestScore();

		this.time.addEvent({
			delay: 1000,
			loop: false,
			callback: () => {
				this.scene.restart();
				this.score = 0;
			},
		});
	}

	flap() {
		this.bird.body.velocity.y = -this.flapVelocity;
	}

	createScore() {
		this.score = 0;
		const bestScore = localStorage.getItem("bestScore");
		this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: "24px", fill: "#000" });
		this.add.text(16, 48, `Best Score: ${bestScore || 0}`, { fontSize: "18px", fill: "#000" });
	}

	createPause() {
		const pauseButton = this.add
			.image(this.config.width - 16, 16, "pause")
			.setScale(2)
			.setInteractive()
			.setOrigin(1, 0);

		pauseButton.on("pointerdown", () => {
			this.physics.pause();
			this.scene.pause();
		});
	}

	increaseScore() {
		this.score++;
		this.scoreText.setText(`Score: ${this.score}`);
	}

	saveBestScore() {
		const bestScoreText = localStorage.getItem("bestScore");
		const bestScore = bestScoreText && parseInt(bestScoreText, 10);

		if (!bestScore || this.score > bestScore) {
			localStorage.setItem("bestScore", this.score);
		}
	}
}

export default PlayScene;
