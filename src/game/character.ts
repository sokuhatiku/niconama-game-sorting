import { Tween, Timeline } from "@akashic-extension/akashic-timeline";
import { PositionNavigator } from "./positionNavigator";
import { GrabbableEntity } from "./grabbableEntity";

export interface CharacterProfile {
	/**
	 * キャラクターのスプライト画像
	 */
	activeSprite: g.ImageAsset;
	/**
	 * キャラクターが非アクティブ状態の差分スプライト画像
	 */
	inactiveSprite: g.ImageAsset;
	/**
	 * キャラクターの当たり判定は与えられたスプライトに依存しますが、この値を使って当たり判定の範囲を調整できます。
	 */
	grabSizeExpand: g.CommonRect;
	/**
	 * 配置されると得点になるエリアのID
	 */
	goalAreaId: string;
}

export interface PointEvent {
	point: g.CommonOffset;
}

export interface PointMoveEvent extends PointEvent {
	prevDelta: g.CommonOffset;
	startDelta: g.CommonOffset;
}

export class Character {
	private readonly _timeline: Timeline;
	private _navPoints: g.CommonOffset[] = [];
	private _movingDirection: g.CommonOffset = { x: 0, y: 0 };
	private _navigator: PositionNavigator | null = null;
	private readonly _grabEntity: GrabbableEntity;

	private _pointDownTrigger = new g.Trigger<PointEvent>();
	private _pointMoveTrigger = new g.Trigger<PointMoveEvent>();
	private _pointUpTrigger = new g.Trigger<PointEvent>();
	public get onPointDown(): g.Trigger<PointEvent> {
		return this._pointDownTrigger;
	}
	public get onPointMove(): g.Trigger<PointMoveEvent> {
		return this._pointMoveTrigger;
	}
	public get onPointUp(): g.Trigger<PointEvent> {
		return this._pointUpTrigger;
	}

	private readonly _profile: CharacterProfile;
	private readonly _movableArea: g.CommonArea;
	private readonly _rootEntity: g.Sprite;
	private _currentMoving: Tween | null = null;

	public get entity(): g.E {
		return this._rootEntity;
	}

	public get profile(): CharacterProfile {
		return this._profile;
	}

	public get isInteractable(): boolean {
		return this._grabEntity.grabbable;
	}

	public constructor(params: {
		scene: g.Scene;
		parent?: g.Scene | g.E;
		timeline: Timeline;
		profile: CharacterProfile;
		spawnPoint: g.CommonOffset;
		movableArea: g.CommonArea;
	}) {
		this._profile = params.profile;
		this._timeline = params.timeline;

		const sprite = params.profile.activeSprite;

		// 移動可能エリアの大きさを予めスプライトの大きさ分小さくしておく
		// これにより、スプライトの端がエリアの端に触れたときにスプライトがはみ出さないようにする
		// 移動処理時には左上を基準に移動するので、左上を基準に縮小する
		const leftTopShurinkedArea = {
			x: params.movableArea.x,
			y: params.movableArea.y,
			width: params.movableArea.width - sprite.width,
			height: params.movableArea.height - sprite.height,
		};
		this._movableArea = leftTopShurinkedArea;

		const entity = new g.Sprite({
			scene: params.scene,
			src: sprite,
			width: sprite.width,
			height: sprite.height,
			touchable: false,
			local: true,
			parent: params.parent ?? params.scene,
		});
		this._rootEntity = entity;

		// ドラッグ&ドロップの場合はスプライトの中心をエンティティの座標として計算するため、中心をピボットとして移動可能エリアを縮小する
		const centerShurinkedArea = {
			x: params.movableArea.x + sprite.width * 0.5,
			y: params.movableArea.y + sprite.height * 0.5,
			width: params.movableArea.width - sprite.width,
			height: params.movableArea.height - sprite.height,
		};
		const grabExpand = params.profile.grabSizeExpand;
		const grabEntity = new GrabbableEntity({
			scene: params.scene,
			parent: entity,
			size: {
				width: sprite.width + grabExpand.left + grabExpand.right,
				height: sprite.height + grabExpand.top + grabExpand.bottom,
			},
			offset: {
				x: (sprite.width - grabExpand.left + grabExpand.right) * 0.5,
				y: (sprite.height - grabExpand.top + grabExpand.bottom) * 0.5,
			},
			constraintArea: centerShurinkedArea,
			moveCallback: (worldPoint) => {
				this.setPosition(worldPoint);
			},
		});
		grabEntity.onPointDown.add((ev) => {
			this._currentMoving?.cancel();
			this._pointDownTrigger.fire(ev);
		});
		grabEntity.onPointMove.add((ev) => {
			this._pointMoveTrigger.fire(ev);
		});
		grabEntity.onPointUp.add((ev) => {
			this._pointUpTrigger.fire(ev);
		});
		this._grabEntity = grabEntity;

		entity.onUpdate.add(() => {
			if (this._grabEntity.grabbing) {
				return;
			}

			this.moving();
		});

		this.setPosition(params.spawnPoint);
	}

	private moving(): void {
		// 現在の移動処理が終了していない場合は何もしない
		if (this._currentMoving && !this._currentMoving.isFinished()) {
			return;
		}

		if (this._navPoints.length === 0) {
			// 移動先がない場合はルートを再作成
			this.reroute();
		}

		// 次の移動先を取得
		const nextPoint = this._navPoints.shift();

		if (!nextPoint) {
			return;
		}

		// 移動先が移動可能エリアの外の場合は再ルート
		// (ナビゲータが正常なら起こらないはずではあるが、起きたとしても戻れるようにしておく)
		if (!isAreaContainsPoint(this._movableArea, nextPoint)) {
			this.rerouteRandomPoint();
			return;
		}

		// 1秒あたりの移動距離(px)
		const speed = 100;

		// 現在の座標から目的地までの距離を計算
		const currentPoint = this.currentPoint;
		const distanceX = nextPoint.x - currentPoint.x;
		const distanceY = nextPoint.y - currentPoint.y;
		const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

		// 移動にかかる時間を計算
		const duration = (distance / speed) * 1000;

		// 移動方向を計算
		this._movingDirection = {
			x: distanceX / distance,
			y: distanceY / distance,
		};

		// 移動アニメーションを開始
		this._currentMoving = this.createMoveTween(nextPoint, duration);
	}

	private get currentPoint(): g.CommonOffset {
		return this._rootEntity.localToGlobal({ x: 0, y: 0 });
	}

	private createMoveTween(point: g.CommonOffset, duration: number): Tween {
		// tweenを作る際には親のローカル座標での移動になるため変換が必要
		const localPoint =
			this._rootEntity.parent instanceof g.E
				? this._rootEntity.parent.globalToLocal(point)
				: point;
		return this._timeline
			.create(this._rootEntity)
			.moveTo(localPoint.x, localPoint.y, duration);
	}

	private setPosition(point: g.CommonOffset): void {
		const modifiedPoint = {
			x: point.x - this._rootEntity.width * 0.5,
			y: point.y - this._rootEntity.height * 0.5,
		};
		const localPoint =
			this._rootEntity.parent instanceof g.E
				? this._rootEntity.parent.globalToLocal(modifiedPoint)
				: modifiedPoint;
		this._rootEntity.moveTo(localPoint.x, localPoint.y);
		this._rootEntity.modified();
	}

	private reroute(): void {
		if (!this._navigator) {
			return;
		}

		const pos = this._rootEntity.localToGlobal({ x: 0, y: 0 });
		this._navPoints = this._navigator.getNextPath({
			startPosition: { x: pos.x, y: pos.y },
			startDirection: this._movingDirection,
			maxDistance: 300,
			rect: {
				top: 0,
				left: 0,
				right: this._rootEntity.width,
				bottom: this._rootEntity.height,
			},
		});
	}

	private rerouteRandomPoint(): void {
		if (!this._navigator) {
			return;
		}

		// エリア内のランダムなポイントを次の目的地に設定する
		this._navPoints = [
			this._navigator.getRandomPoint({
				top: 0,
				left: 0,
				right: this._rootEntity.width,
				bottom: this._rootEntity.height,
			}),
		];
	}

	public setNavigator(navigator: PositionNavigator | null): void {
		if (this._navigator === navigator) {
			return;
		}
		this._navigator = navigator;
		this.reroute();
	}

	public setInteractable(isDraggable: boolean): void {
		this._rootEntity.src = isDraggable
			? this._profile.activeSprite
			: this._profile.inactiveSprite;
		this._rootEntity.invalidate();

		this._grabEntity.grabbable = isDraggable;
	}

	public destroy(): void {
		this._currentMoving?.cancel();
		this._rootEntity.hide();
		this._rootEntity.invalidate();
		this._rootEntity.destroy();
	}
}

function isAreaContainsPoint(
	area: g.CommonArea,
	point: g.CommonOffset,
): boolean {
	return (
		point.x >= area.x &&
		point.x <= area.x + area.width &&
		point.y >= area.y &&
		point.y <= area.y + area.height
	);
}
