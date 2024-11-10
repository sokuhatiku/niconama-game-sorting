export class GameScore {
	// キャラクターを正しいエリアに運んだ回数
	private _correctSortingCount: number = 0;
	// キャラクターを間違ったエリア(出荷中のエリアも含む)に運んだ回数
	private _incorrectSortingCount: number = 0;
	// エリアが出荷された回数
	private _shippedCount: number = 0;
	// ダブル出荷ボーナスが発生した回数
	private _doubleShippedCount: number = 0;

	// 振り分けポイント
	private _sortingPoint: number = 0;
	// 品質ボーナスポイント
	private _qualityPoint: number = 0;
	// 出荷ボーナスポイント
	private _shippingPoint: number = 0;

	// 全ての加点要素、減点要素を集計してスカラー化した値
	private _totalScore: number = 0;

	private _scoreUpdatedTrigger: g.Trigger<number> = new g.Trigger<number>();

	public get correctSortingCount(): number {
		return this._correctSortingCount;
	}

	public get incorrectSortingCount(): number {
		return this._incorrectSortingCount;
	}

	public get shippedCount(): number {
		return this._shippedCount;
	}

	public get doubleShippedCount(): number {
		return this._doubleShippedCount;
	}

	public get sortingPoint(): number {
		return this._sortingPoint;
	}

	public get qualityPoint(): number {
		return this._qualityPoint;
	}

	public get shippingPoint(): number {
		return this._shippingPoint;
	}

	public get totalSortingCount(): number {
		return this._correctSortingCount + this._incorrectSortingCount;
	}

	public get sortingQuality(): number {
		const totalSortings = this.totalSortingCount;
		return totalSortings === 0
			? 0
			: this._correctSortingCount / totalSortings;
	}

	public get totalScore(): number {
		return this._totalScore;
	}

	public get onTotalScoreUpdated(): g.Trigger<number> {
		return this._scoreUpdatedTrigger;
	}

	public incrementCorrectSortingCount(): void {
		this._correctSortingCount++;
		this._updateTotalScore();
	}

	public incrementIncorrectSortingCount(): void {
		this._incorrectSortingCount++;
		this._updateTotalScore();
	}

	public incrementShippedCount(): void {
		this._shippedCount++;
		this._updateTotalScore();
	}

	public incrementDoubleShippedCount(): void {
		this._doubleShippedCount++;
		this._updateTotalScore();
	}

	private _updateTotalScore(): void {
		// スコア集計処理
		// 総スコア=(正しい振り分け数×基礎点)+(正しい振り分け数×基礎点×精度ボーナス率)+((出荷回数+ダブル出荷回数)×出荷ボーナス)

		const basePoint = 10;
		const qualityBonusRate = 0.5;
		const shippingBonus = 10;

		this._sortingPoint = this._correctSortingCount * basePoint;

		this._qualityPoint =
			this._correctSortingCount * basePoint * qualityBonusRate;

		this._shippingPoint =
			(this._shippedCount + this.doubleShippedCount) * shippingBonus;

		const totalScore =
			this._sortingPoint + this._qualityPoint + this._shippingPoint;

		if (this._totalScore !== totalScore) {
			this._totalScore = totalScore;
			this._scoreUpdatedTrigger.fire(this._totalScore);
		}
	}
}
