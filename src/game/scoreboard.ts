export class Scoreboard {
	private _entity: g.E;

	private _correctCountLabel: g.Label;
	private _qualityPointLabel: g.Label;
	private _sippingCountLabel: g.Label;
	private _scoreLabel: g.Label;

	private _correctCount = 0;
	private _incorrectCount = 0;
	private _sippingCount = 0;
	private _score = 0;

	private _scoreUpdatedTrigger = new g.Trigger<number>();

	public get entity(): g.E {
		return this._entity;
	}

	public get onScoreUpdated(): g.Trigger<number> {
		return this._scoreUpdatedTrigger;
	}

	public constructor(param: {
		scene: g.Scene;
		parent?: g.Scene | g.E;
		font?: g.Font;
	}) {
		const root = new g.E({
			scene: param.scene,
			x: 0,
			y: 0,
			width: g.game.width,
			height: g.game.height,
		});
		this._entity = root;
		const parent = param.parent ?? param.scene;
		parent.append(root);

		const font =
			param.font ??
			new g.DynamicFont({
				game: g.game,
				fontFamily: "sans-serif",
				size: 48,
			});

		const correctPointLabel = new g.Label({
			scene: param.scene,
			font: font,
			text: "0",
			x: 0,
			y: 48 * 0,
			width: g.game.width,
			height: 48,
		});
		correctPointLabel.aligning(g.game.width, "right");
		correctPointLabel.invalidate();
		root.append(correctPointLabel);
		this._correctCountLabel = correctPointLabel;

		const incorrectPointLabel = new g.Label({
			scene: param.scene,
			font: font,
			text: "0",
			x: 0,
			y: 48 * 1,
			width: g.game.width,
			height: 48,
		});
		incorrectPointLabel.aligning(g.game.width, "right");
		incorrectPointLabel.invalidate();
		root.append(incorrectPointLabel);
		this._qualityPointLabel = incorrectPointLabel;

		const sippingPointLabel = new g.Label({
			scene: param.scene,
			font: font,
			text: "0",
			x: 0,
			y: 48 * 2,
			width: g.game.width,
			height: 48,
		});
		sippingPointLabel.aligning(g.game.width, "right");
		sippingPointLabel.invalidate();
		root.append(sippingPointLabel);
		this._sippingCountLabel = sippingPointLabel;

		const scoreLabel = new g.Label({
			scene: param.scene,
			font: font,
			text: "0",
			x: 0,
			y: 48 * 3,
			width: g.game.width,
			height: 48,
		});
		scoreLabel.aligning(g.game.width, "right");
		scoreLabel.invalidate();
		root.append(scoreLabel);
		this._scoreLabel = scoreLabel;

		this.updateScore();
	}

	/**
	 * 各種得点・減点要素をすべて加味した、スカラー値としてのスコア量を返します
	 */
	public get summary(): number {
		return this._score;
	}

	public addCorrectPoint(): void {
		this._correctCount++;
		this.updateScore();
	}

	public addIncorrectPoint(): void {
		this._incorrectCount++;
		this.updateScore();
	}

	public addSippingPoint(): void {
		this._sippingCount++;
		this.updateScore();
	}

	private updateScore(): void {
		const deliveryCount = this._correctCount + this._incorrectCount;
		const quality =
			this._correctCount === 0
				? 0
				: (Math.max(this._correctCount - this._incorrectCount, 0) /
						this._correctCount) *
					100;
		const baseScore = this._correctCount * 100;
		const totalScore = Math.floor((baseScore * quality) / 100);

		if (this._score !== totalScore) {
			this._score = totalScore;
			this._scoreUpdatedTrigger.fire(this._score);
		}

		const correctText = `納品:${String(deliveryCount)}`;
		const qualityText = `品質:${quality.toFixed(2)}%`;
		const sippingText = `出荷:${String(this._sippingCount)}`;
		const scoreText = `スコア:${String(this._score)}`;

		if (this._correctCountLabel.text !== correctText) {
			this._correctCountLabel.text = correctText;
			this._correctCountLabel.invalidate();
		}
		if (this._qualityPointLabel.text !== qualityText) {
			this._qualityPointLabel.text = qualityText;
			this._qualityPointLabel.invalidate();
		}
		if (this._sippingCountLabel.text !== sippingText) {
			this._sippingCountLabel.text = sippingText;
			this._sippingCountLabel.invalidate();
		}
		if (this._scoreLabel.text !== scoreText) {
			this._scoreLabel.text = scoreText;
			this._scoreLabel.invalidate();
		}
	}
}
