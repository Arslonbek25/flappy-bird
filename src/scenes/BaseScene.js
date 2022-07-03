import Phaser from "phaser";

class BaseScene extends Phaser.Scene {
	constructor(key, config) {
		super(key);
		this.config = config;
		this.screenCenter = [config.width / 2, config.height / 2];
		this.fontSize = "34px";
		this.lineHeight = 42;
		this.fontOptions = { fontSize: this.fontSize, fill: "#FFF" };
	}

	create() {
		this.add.image(0, 0, "sky").setOrigin(0);
		if (this.config.canGoBack) {
			const backButton = this.add.image(16, 16, "back").setScale(2).setInteractive().setOrigin(0);

			backButton.on("pointerup", () => {
				this.scene.start("MenuScene");
			});
		}
	}

	createMenu(menu, setupMenuEvents) {
		let lastMenuPosition = 0;

		menu.forEach(menuItem => {
			const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPosition];
			menuItem.textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
			lastMenuPosition += this.lineHeight;
			setupMenuEvents(menuItem);
		});
	}
}

export default BaseScene;
