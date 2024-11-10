import type { Timeline, Tween } from "@akashic-extension/akashic-timeline";

export class CountUpEffectLabel {
	private readonly _root: g.E;
	private readonly _numberLabel: g.Label;
	private _targetValue: number = 0;
	private readonly _sceneTimeline: Timeline;

	public get entity(): g.E {
		return this._root;
	}

	public set value(value: number) {
		this._targetValue = value;
		this._numberLabel.text = value.toString();
		this._numberLabel.invalidate();
	}

	public constructor(params: {
		scene: g.Scene;
		sceneTimeline: Timeline;
		parent: g.E;
		font: g.Font;
		fontSize: number;
		x: number;
		y: number;
		width: number;
		height: number;
		suffix: string;
		value: number;
	}) {
		this._targetValue = params.value;
		this._sceneTimeline = params.sceneTimeline;

		const root = new g.E({
			scene: params.scene,
			x: params.x,
			y: params.y,
			width: params.width,
			height: params.height,
			parent: params.parent,
		});
		this._root = root;

		const suffixLabelSize = params.font.measureText(params.suffix);

		const numberLabel = new g.Label({
			scene: params.scene,
			text: "0",
			font: params.font,
			fontSize: params.fontSize,
			width: root.width - suffixLabelSize.width,
			textAlign: "right",
			widthAutoAdjust: false,
			parent: root,
		});
		this._numberLabel = numberLabel;

		const suffixLabel = new g.Label({
			scene: params.scene,
			text: params.suffix,
			font: params.font,
			fontSize: params.fontSize,
			width: suffixLabelSize.width,
			x: root.width - suffixLabelSize.width,
			textAlign: "left",
			widthAutoAdjust: false,
			parent: root,
		});
		suffixLabel.invalidate();
	}

	public startCountUp(dulation: number): Tween {
		let currentValue = 0;
		return this._sceneTimeline
			.create(this._numberLabel)
			.every((_e, p) => {
				const value = Math.floor(this._targetValue * p);
				if (currentValue !== value) {
					currentValue = value;
					if (isNaN(currentValue)) {
						currentValue = 0;
					}
					this._numberLabel.text = currentValue.toString();
					this._numberLabel.invalidate();
				}
			}, dulation)
			.call(() => {
				this._numberLabel.text = this._targetValue.toString();
				this._numberLabel.invalidate();
			});
	}
}
