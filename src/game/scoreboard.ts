import * as al from "@akashic-extension/akashic-label";
import type { GameScore } from "./gameScore";

export class Scoreboard {
	private readonly _scoreCounter: GameScore;
	private _root: g.E;

	private _label: al.Label;
	private _score: number = 0;

	private _scoreUpdatedTrigger: g.Trigger<number> = new g.Trigger<number>();

	public get entity(): g.E {
		return this._root;
	}

	public get onScoreUpdated(): g.Trigger<number> {
		return this._scoreUpdatedTrigger;
	}

	public constructor(param: {
		scene: g.Scene;
		parent?: g.Scene | g.E;
		font?: g.Font;
		scoreCounter: GameScore;
	}) {
		this._scoreCounter = param.scoreCounter;
		const areaWidth = 500;
		const root = new g.FilledRect({
			scene: param.scene,
			x: g.game.width - areaWidth,
			y: 0,
			width: areaWidth,
			height: 0,
			cssColor: "rgba(255, 255, 255, 0.5)",
		});
		this._root = root;
		const parent = param.parent ?? param.scene;
		parent.append(root);

		const font =
			param.font ??
			new g.DynamicFont({
				game: g.game,
				fontFamily: "sans-serif",
				size: 30,
			});

		const label = new al.Label({
			scene: param.scene,
			text: "",
			font: font,
			fontSize: 30,
			width: root.width,
			parent: root,
			lineBreak: true,
			textAlign: "right",
		});
		this._label = label;

		param.scoreCounter.onTotalScoreUpdated.add((_score) => {
			this.updateScore();
		});

		this.updateScore();
	}

	/**
	 * 各種得点・減点要素をすべて加味した、スカラー値としてのスコア量を返します
	 */
	public get summary(): number {
		return this._score;
	}

	private updateScore(): void {
		const s = this._scoreCounter;
		this._label.text = `
		納品: ${s.correctSortingCount}匹 → ${s.sortingPoint}pt
		品質: ${(s.sortingQuality * 100).toFixed(0)}％ → ${s.qualityPoint}pt
		出荷: ${s.shippedCount}+${s.doubleShippedCount}回 → ${s.shippingPoint}pt
		最終スコア: ${s.totalScore}pt
		`.trim();
		this._label.invalidate();
		this._root.height = this._label.height;
		this._root.modified();
	}
}
