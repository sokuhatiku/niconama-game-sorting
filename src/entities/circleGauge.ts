import { AssetLoader } from "../assetLoader";

export class CircleGauge {
	private readonly _root: g.E;
	private readonly _rightSide: g.E;
	private readonly _leftSide: g.E;

	public constructor(param: {
		scene: g.Scene;
		parent?: g.Scene | g.E;
		x: number;
		y: number;
		amount: number;
	}) {
		const root = new g.E({
			scene: param.scene,
			x: param.x,
			y: param.y,
			anchorX: 0.5,
			anchorY: 0.5,
			parent: param.parent ?? param.scene,
		});
		this._root = root;

		// 半円を2つ使って円形ゲージを描画する
		const assetLoader = new AssetLoader(param.scene);
		const semicircle = assetLoader.getImage(
			"/image/circle_gauge_parts.png",
		);

		const leftSide = new g.Pane({
			scene: param.scene,
			width: semicircle.width,
			height: semicircle.height,
			anchorX: 1,
			anchorY: 0.5,
			x: root.width / 2,
			y: root.height / 2,
			parent: root,
		});
		const leftSideSprite = new g.Sprite({
			scene: param.scene,
			src: semicircle,
			anchorX: 0,
			anchorY: 0.5,
			x: semicircle.width,
			y: semicircle.height / 2,
			srcWidth: semicircle.width,
			srcHeight: semicircle.height,
			parent: leftSide,
		});
		this._leftSide = leftSideSprite;

		const rightSide = new g.Pane({
			scene: param.scene,
			width: semicircle.width,
			height: semicircle.height,
			anchorX: 0,
			anchorY: 0.5,
			x: root.width / 2,
			y: root.height / 2,
			parent: root,
		});
		const rightSideSprite = new g.Sprite({
			scene: param.scene,
			src: semicircle,
			anchorX: 0,
			anchorY: 0.5,
			y: semicircle.height / 2,
			srcWidth: semicircle.width,
			srcHeight: semicircle.height,
			parent: rightSide,
		});
		this._rightSide = rightSideSprite;

		this.setAmount(param.amount);
	}

	public setAmount(amount: number): void {
		// leftSideは0度から180度までの範囲の回転
		const leftSideAngle = Math.min(0.5, Math.max(0, amount)) * 360;
		this._leftSide.angle = leftSideAngle;
		this._leftSide.modified();

		// rightSideは180度から360度までの範囲の回転
		const rightSideAngle = Math.min(1, Math.max(0.5, amount)) * 360;
		this._rightSide.angle = rightSideAngle;
		this._rightSide.modified();
	}
}
