import * as al from "@akashic-extension/akashic-label";
import type { Timeline, Tween } from "@akashic-extension/akashic-timeline";
import { AssetLoader } from "../assetLoader";
import type { GameScore } from "../game/gameScore";
import { CountUpEffectLabel } from "../result/countUpEffectLabel";
import { getNiconamaScoreRuby } from "../utils/niconama";
import type { Phase } from ".";

export class ResultPhase implements Phase {
	public readonly name: string = "result";

	private readonly _score: GameScore;
	private readonly _font: g.Font;
	private readonly _timeline: Timeline;
	private readonly _background: g.FilledRect;
	private readonly _countUpSound: g.AudioAsset;
	private readonly _countFinishSound: g.AudioAsset;

	public constructor(params: {
		scene: g.Scene;
		layer: g.E;
		font: g.Font;
		timeline: Timeline;
		scoreCounter: GameScore;
	}) {
		this._score = params.scoreCounter;
		this._font = params.font;
		this._timeline = params.timeline;

		const background = new g.FilledRect({
			scene: params.scene,
			cssColor: "rgba(255, 255, 255, 0.9)",
			x: g.game.width * 0.1,
			y: g.game.height * 0.1,
			width: g.game.width * 0.8,
			height: g.game.height * 0.8,
			parent: params.layer,
		});
		this._background = background;

		background.hide();

		const assetLoader = new AssetLoader(params.scene);
		this._countUpSound = assetLoader.getAudio("/audio/count_up");
		this._countFinishSound = assetLoader.getAudio("/audio/count_finish");
	}

	public enter(): void {
		this._background.show();
		this.beginFinnalScoreShowing();
	}

	public update(): void {
		// do nothing
	}
	public exit(): void {
		this._background.hide();
	}

	private beginFinnalScoreShowing(): void {
		const sortingScoreLine = this.createScoreLine({
			y: 20,
			label: "仕分け回数",
			middleLabel: `${this._score.correctSortingCount}回`,
			point: this._score.sortingPoint,
			pointSuffix: "pt",
		});

		const qualityScoreLine = this.createScoreLine({
			y: 100,
			label: "品質",
			middleLabel: `${(this._score.sortingQuality * 100).toFixed(1)}%`,
			point: this._score.qualityPoint,
			pointSuffix: "pt",
		});

		const shippingScoreLine = this.createScoreLine({
			y: 180,
			label: "出荷回数",
			middleLabel:
				this._score.doubleShippedCount === 0
					? `${this._score.shippedCount}回`
					: `${this._score.shippedCount}回+${this._score.doubleShippedCount}`,
			point: this._score.shippingPoint,
			pointSuffix: "pt",
		});

		const totalScoreLine = this.createTotalScoreLine({
			y: 280,
			label: "最終スコア",
			point: this._score.totalScore,
			pointSuffix: "pt",
		});

		this._timeline
			.create(this._background)
			.call(() => {
				// 仕分け回数の表示
				sortingScoreLine.leftLabel.show();
				sortingScoreLine.middleLabel.show();
			})
			.wait(200)
			.call(() => {
				// 仕分けポイントの表示
				const dulation = Math.min(500, this._score.sortingPoint);
				sortingScoreLine.rightLabel.entity.show();
				sortingScoreLine.rightLabel.startCountUp(dulation);
				this.playCountUpSound(dulation);
			})
			.wait(1000)
			.call(() => {
				// 品質の表示
				qualityScoreLine.leftLabel.show();
				qualityScoreLine.middleLabel.show();
			})
			.wait(200)
			.call(() => {
				// 品質ポイントの表示
				const dulation = Math.min(500, this._score.qualityPoint);
				qualityScoreLine.rightLabel.entity.show();
				qualityScoreLine.rightLabel.startCountUp(dulation);
				this.playCountUpSound(dulation);
			})
			.wait(1000)
			.call(() => {
				// 出荷回数の表示
				shippingScoreLine.leftLabel.show();
				shippingScoreLine.middleLabel.show();
			})
			.wait(200)
			.call(() => {
				// 出荷ポイントの表示
				const dulation = Math.min(500, this._score.shippingPoint);
				shippingScoreLine.rightLabel.entity.show();
				shippingScoreLine.rightLabel.startCountUp(dulation);
				this.playCountUpSound(dulation);
			})
			.wait(1000)
			.call(() => {
				// 最終スコアの表示
				totalScoreLine.leftLabel.show();
			})
			.wait(500)
			.call(() => {
				// 最終スコアの表示
				const dulation = Math.min(500, this._score.totalScore);
				totalScoreLine.rightLabel.entity.show();
				totalScoreLine.rightLabel.startCountUp(dulation).call(() => {
					this._countFinishSound.play();
				});
				if (this._score.totalScore > 0) {
					this.playCountUpSound(dulation);
				}
			})
			.wait(1000)
			.call(() => {
				new al.Label({
					scene: this._background.scene,
					text: `以下の数値がニコ生で集計されます
					${getNiconamaScoreRuby(this._score)}`,
					font: this._font,
					fontSize: 50,
					x: 0,
					y: 420,
					width: this._background.width,
					widthAutoAdjust: false,
					textAlign: "center",
					parent: this._background,
					rubyEnabled: true,
				});
			});
	}

	private createScoreLine(param: {
		y: number;
		label: string;
		middleLabel: string;
		point: number;
		pointSuffix: string;
	}): {
			leftLabel: g.Label;
			middleLabel: g.Label;
			rightLabel: CountUpEffectLabel;
		} {
		const fontSize = 50;
		const padding = 10;

		const background = this._background;
		const leftLabel = new g.Label({
			scene: background.scene,
			text: param.label,
			font: this._font,
			fontSize: fontSize,
			x: padding,
			y: param.y,
			width: background.width - padding * 2,
			widthAutoAdjust: false,
			textAlign: "left",
			parent: background,
		});
		leftLabel.hide();

		const middleLabel = new g.Label({
			scene: background.scene,
			text: param.middleLabel,
			font: this._font,
			fontSize: fontSize,
			x: padding,
			y: param.y,
			width: background.width - padding * 2,
			widthAutoAdjust: false,
			textAlign: "center",
			parent: background,
		});
		middleLabel.hide();

		const rightLabel = new CountUpEffectLabel({
			parent: background,
			scene: background.scene,
			sceneTimeline: this._timeline,
			font: this._font,
			fontSize: fontSize,
			x: 0,
			y: param.y,
			width: background.width - padding * 2,
			height: fontSize,
			suffix: param.pointSuffix,
			value: param.point,
		});
		rightLabel.entity.hide();

		return { leftLabel, middleLabel, rightLabel };
	}

	private createTotalScoreLine(param: {
		y: number;
		label: string;
		point: number;
		pointSuffix: string;
	}): { leftLabel: g.Label; rightLabel: CountUpEffectLabel } {
		const fontSize = 70;
		const padding = 10;

		const background = this._background;
		const leftLabel = new g.Label({
			scene: background.scene,
			text: param.label,
			font: this._font,
			fontSize: fontSize,
			x: padding,
			y: param.y,
			width: background.width - padding * 2,
			widthAutoAdjust: false,
			textAlign: "left",
			parent: background,
		});
		leftLabel.hide();

		const rightLabel = new CountUpEffectLabel({
			parent: background,
			scene: background.scene,
			sceneTimeline: this._timeline,
			font: this._font,
			fontSize: fontSize,
			x: padding,
			y: param.y,
			width: background.width - padding * 2,
			height: fontSize,
			suffix: param.pointSuffix,
			value: param.point,
		});
		rightLabel.entity.hide();

		return { leftLabel, rightLabel };
	}

	private playCountUpSound(dulation: number): Tween {
		const audioLength = 100;

		let loopCount = -1;

		return this._timeline.create(this._background).every((e) => {
			const currentLoop = Math.floor(e / audioLength);
			if (currentLoop !== loopCount) {
				this._countUpSound.stop();
				this._countUpSound.play();
				loopCount = currentLoop;
			}
		}, dulation);
	}
}

