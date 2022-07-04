import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
	constructor(config) {
		super("PlayScene", config);

		this.isPaused = false;

		this.flapVelocity = 300;
		this.pipesToRender = 4;
		this.gravity = 800;

		this.score = 0;
		this.scoreText = "";

		this.currentDifficulty = "easy";
		this.difficulties = {
			easy: {
				pipeDistanceRange: [300, 350],
				pipeOpeningRange: [150, 200],
			},
			normal: {
				pipeDistanceRange: [280, 330],
				pipeOpeningRange: [140, 190],
			},
			hard: {
				pipeDistanceRange: [250, 310],
				pipeOpeningRange: [120, 170],
			},
		};
	}

	create() {
		this.currentDifficulty = "easy";
		super.create();
		this.createBird();
		this.createPipes();
		this.createColliders();
		this.createScore();
		this.createPause();
		this.handleInputs();
		this.listenToEvents();

		this.anims.create({
			key: "fly",
			frames: this.anims.generateFrameNumbers("bird", { start: 9, end: 15 }),
			frameRate: 8, // 24fps default
			repeat: -1,
		});

		this.bird.play("fly");
	}

	update() {
		this.recyclePipes();
		this.checkGameStatus();
	}

	listenToEvents() {
		if (this.pauseEvent) return;

		this.pauseEvent = this.events.on("resume", () => {
			this.initialTime = 3;
			this.countdownText = this.add
				.text(...this.screenCenter, `Fly in: ${this.initialTime}`, this.fontOptions)
				.setOrigin(0.5);
			this.timedEvent = this.time.addEvent({
				delay: 1000,
				callback: this.countdown,
				callbackScope: this,
				loop: true,
			});
		});
	}

	countdown() {
		this.initialTime--;
		this.countdownText.setText(`Fly in: ${this.initialTime}`);
		if (this.initialTime <= 0) {
			this.isPaused = false;
			this.countdownText.setText("");
			this.physics.resume();
			this.timedEvent.remove();
		}
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
			.setFlipX(true)
			.setScale(3)
			.setOrigin(0);

		this.bird.setBodySize(this.bird.width, this.bird.height - 8);
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
		const difficulty = this.difficulties[this.currentDifficulty];
		const rightMostX = this.getRightMostPipe();
		const pipeOffset = Phaser.Math.Between(...difficulty.pipeOpeningRange);
		const pipeYPos = Phaser.Math.Between(20, this.config.height - pipeOffset - 20);
		const pipeDistance = Phaser.Math.Between(...difficulty.pipeDistanceRange);

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
			this.increaseDifficulty();
			pipesToMove = [];
		}
	}

	increaseDifficulty() {
		if (this.score === 1) this.currentDifficulty = "normal";
		if (this.score === 3) this.currentDifficulty = "hard";
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
		if (this.isPaused) return;
		this.bird.body.velocity.y = -this.flapVelocity;
	}

	createScore() {
		this.score = 0;
		const bestScore = localStorage.getItem("bestScore");
		this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, { fontSize: "24px", fill: "#000" });
		this.add.text(16, 48, `Best Score: ${bestScore || 0}`, { fontSize: "18px", fill: "#000" });
	}

	createPause() {
		this.isPaused = false;
		const pauseButton = this.add
			.image(this.config.width - 16, 16, "pause")
			.setScale(2)
			.setInteractive()
			.setOrigin(1, 0);

		pauseButton.on("pointerdown", () => {
			this.isPaused = true;
			this.physics.pause();
			this.scene.pause();
			this.scene.launch("PauseScene");
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
