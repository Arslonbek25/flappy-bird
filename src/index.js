import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: "arcade",
		arcade: {
			debug: true,
		},
	},
	scene: [PlayScene],
};

const flapVelocity = 250,
	pipesToRender = 4,
	pipeOpeningRange = [100, 250],
	pipeDistanceRange = [400, 450],
	initialBirdPos = {
		x: config.width / 10,
		y: config.height / 2,
	};

let bird, pipes;

let pipeHorizontalDistance = 0;

function preload() {
	this.load.image("sky", "assets/sky.png");
	this.load.image("bird", "assets/bird.png");
	this.load.image("pipe", "assets/pipe.png");
}

function create() {
	this.add.image(0, 0, "sky").setOrigin(0);
	bird = this.physics.add.sprite(initialBirdPos.x, initialBirdPos.y, "bird").setOrigin(0);
	bird.body.gravity.y = 600;

	pipes = this.physics.add.group();

	for (let i = 0; i < pipesToRender; i++) {
		const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
		const lowerPipe = pipes.create(0, 0, "pipe").setOrigin(0);

		placePipe(upperPipe, lowerPipe);
	}

	pipes.setVelocityX(-200);

	this.input.on("pointerdown", flap);
	this.input.keyboard.on("keydown_SPACE", flap);
}

function update(time, delta) {
	recyclePipes();
	if (bird.y > config.height - bird.height || bird.y < 0) restartBirdPosition();
}

function placePipe(uPipe, lPipe) {
	const rightMostX = getRightMostPipe();
	const pipeOffset = Phaser.Math.Between(...pipeOpeningRange);
	const pipeYPos = Phaser.Math.Between(20, config.height - pipeOffset - 20);
	const pipeDistance = Phaser.Math.Between(...pipeDistanceRange);

	uPipe.x = rightMostX + pipeDistance;
	uPipe.y = pipeYPos;

	lPipe.x = uPipe.x;
	lPipe.y = uPipe.y + pipeOffset;
}

function recyclePipes() {
	let pipesToMove = [];

	pipes.getChildren().forEach(pipe => {
		if (pipe.getBounds().right <= 0) pipesToMove.push(pipe);
	});

	if (pipesToMove.length) {
		placePipe(...pipesToMove);
		pipesToMove = [];
	}
}

function getRightMostPipe() {
	let rightMostX = 0;

	pipes.getChildren().forEach(function (pipe) {
		rightMostX = Math.max(pipe.x, rightMostX);
	});

	return rightMostX;
}

function restartBirdPosition() {
	console.log("You have lost!");
	[bird.x, bird.y] = [initialBirdPos.x, initialBirdPos.y];
	bird.body.velocity.y = 0;
}

function flap() {
	bird.body.velocity.y = -flapVelocity;
}

new Phaser.Game(config);
