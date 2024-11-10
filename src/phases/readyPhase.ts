import type { Phase, PhaseEnterParams, PhaseUpdateParams } from ".";

export class ReadyPhase implements Phase {
	private readonly _readyLabel: g.Label;

	public constructor(param: { scene: g.Scene; layer: g.E; font: g.Font }) {
		const label = new g.Label({
			scene: param.scene,
			text: "Ready",
			font: param.font,
			fontSize: 40,
			textAlign: "center",
			width: g.game.width,
			widthAutoAdjust: false,
			y: g.game.height / 2 - 20,
			parent: param.layer,
		});
		label.hide();
		this._readyLabel = label;
	}

	enter(_params: PhaseEnterParams): void {
		this._readyLabel.show();
	}

	update(_params: PhaseUpdateParams): void {
		// do nothing
	}

	exit(): void {
		this._readyLabel.hide();
	}

	get name(): string {
		return "ready";
	}
}
