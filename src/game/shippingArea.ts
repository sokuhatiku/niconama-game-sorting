import { AssetLoader } from "../assetLoader";
import { CircleGauge } from "../components/circleGauge";
import type { AreaParameterObject } from "./area";
import { Area } from "./area";

export interface ShippingAreaParameterObject extends AreaParameterObject {
	x: number;
	y: number;
	width: number;
	height: number;
	cssColor: string;
}

export class ShippingArea extends Area {
	private readonly _cssColor: string;
	private readonly _root: g.E;
	private readonly _coverRect: g.FilledRect;
	private readonly _gauge: CircleGauge;
	private readonly _shippingLabel: g.FrameSprite;
	private readonly _doubleShippingBonusLabel: g.FrameSprite;

	private _active: boolean = true;
	public get isShipping(): boolean {
		return !this._active;
	}

	private _activeTrigger: g.Trigger<boolean> = new g.Trigger();
	public get onActiveChanged(): g.Trigger<boolean> {
		return this._activeTrigger;
	}

	private _innactiveTotalTimer: number = 0;
	private _innactiveTimer: number = 0;

	private _shippingBonus: boolean = false;

	public constructor(param: ShippingAreaParameterObject) {
		super(param);
		this._cssColor = param.cssColor;

		this._root = new g.E({
			scene: param.scene,
			x: param.x,
			y: param.y,
			parent: param.parent ?? param.scene,
		});

		this._coverRect = new g.FilledRect({
			scene: param.scene,
			width: param.width,
			height: param.height,
			cssColor: param.cssColor,
			opacity: 1,
			parent: this._root,
		});

		this._gauge = new CircleGauge({
			scene: param.scene,
			x: param.width / 2,
			y: param.height / 2,
			amount: 0,
			parent: this._root,
		});

		const assetLoader = new AssetLoader(param.scene);
		const shippingLabelAsset = assetLoader.getImage("/image/shipping.png");
		this._shippingLabel = new g.FrameSprite({
			x: param.width / 2,
			y: param.height / 2 - 64,
			anchorX: 0.5,
			anchorY: 0.5,
			scene: param.scene,
			parent: this._root,
			width: shippingLabelAsset.width,
			height: shippingLabelAsset.height * 2,
			src: shippingLabelAsset,
			srcWidth: shippingLabelAsset.width / 2,
			srcHeight: shippingLabelAsset.height,
			frames: [0, 1],
			loop: true,
		});
		this._shippingLabel.hide();

		const doubleShippingBonusLabelAsset = assetLoader.getImage(
			"/image/double_shipping_bonus.png",
		);
		this._doubleShippingBonusLabel = new g.FrameSprite({
			x: param.width / 2,
			y: param.height / 2 + 70,
			anchorX: 0.5,
			anchorY: 0.5,
			scene: param.scene,
			parent: this._root,
			width: doubleShippingBonusLabelAsset.width,
			height: doubleShippingBonusLabelAsset.height * 2,
			src: doubleShippingBonusLabelAsset,
			srcWidth: doubleShippingBonusLabelAsset.width / 2,
			srcHeight: doubleShippingBonusLabelAsset.height,
			frames: [0, 1],
			loop: true,
		});
		this._doubleShippingBonusLabel.hide();

		this._root.onUpdate.add(() => {
			if (this._innactiveTimer > 0) {
				const multiplier = this._shippingBonus ? 5 : 1;
				this._innactiveTimer -= (1 / g.game.fps) * multiplier;
				if (this._innactiveTimer <= 0) {
					this.setActive(true);
					this._shippingBonus = false;
					this._gauge.setAmount(0);
				} else {
					this._gauge.setAmount(
						1 - this._innactiveTimer / this._innactiveTotalTimer,
					);
				}
			}
		});
	}

	public startShipping(duration: number): void {
		this._innactiveTotalTimer = duration;
		this._innactiveTimer = duration;
		this.setActive(false);
		this._activeTrigger.fire(false);
	}

	/**
	 * 次の出荷が終わるまでの間のボーナスを設定します
	 */
	public setOneTimeBonus(): void {
		this._shippingBonus = true;
		if (this._innactiveTimer > 0) {
			this._doubleShippingBonusLabel.show();
			this._doubleShippingBonusLabel.start();
		}
	}

	private setActive(active: boolean): void {
		if (this._active === active) {
			return;
		}
		this._active = active;
		this._coverRect.cssColor = active ? this._cssColor : "black";
		this._activeTrigger.fire(active);
		if (active) {
			this._shippingLabel.hide();
			this._doubleShippingBonusLabel.hide();
		} else {
			this._shippingLabel.show();
			this._shippingLabel.start();
			if (this._shippingBonus) {
				this._doubleShippingBonusLabel.show();
				this._doubleShippingBonusLabel.start();
			}
		}
	}
}
