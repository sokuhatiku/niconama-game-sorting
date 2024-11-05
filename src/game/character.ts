import type { Tween, Timeline } from "@akashic-extension/akashic-timeline";
import { GrabbableEntity } from "./grabbableEntity";
import type { PositionNavigator } from "./positionNavigator";

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
	 * キャラクターのスプライトの拡大率
	 * 1.0で等倍
	 * grabSizeやcollisionSizeの指定にも影響する
	 */
	sizeScale?: number;
	/**
	 * キャラクターのタップに対する当たり判定
	 * 画像の中心を原点とした矩形領域で指定する
	 * 指定しない場合はactiveSpriteと同じ大きさとなる
	 */
	grabSize?: g.CommonArea;
	/**
	 * キャラクターの地形に対する当たり判定
	 * 画像の中心を原点とした矩形領域で指定する
	 * 指定しない場合はactiveSpriteと同じ大きさとなる
	 */
	collisionSize?: g.CommonArea;
	/**
	 * 配置されると得点になるエリアのID
	 */
	goalAreaId: string;
	/**
	 * キャラクターの移動速度(px/s)
	 */
	speed: number;
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
	private readonly _profile: CharacterProfile;
	private readonly _rootEntity: g.E;
	private readonly _spriteEntity: g.Sprite;
	private readonly _collider: g.CommonArea;
	private readonly _speed: number;
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

	private _pointDownTrigger: g.Trigger<PointEvent> =
		new g.Trigger<PointEvent>();
	private _pointMoveTrigger: g.Trigger<PointMoveEvent> =
		new g.Trigger<PointMoveEvent>();
	private _pointUpTrigger: g.Trigger<PointEvent> =
		new g.Trigger<PointEvent>();
	public get onPointDown(): g.Trigger<PointEvent> {
		return this._pointDownTrigger;
	}
	public get onPointMove(): g.Trigger<PointMoveEvent> {
		return this._pointMoveTrigger;
	}
	public get onPointUp(): g.Trigger<PointEvent> {
		return this._pointUpTrigger;
	}

	public constructor(params: {
		scene: g.Scene;
		parent?: g.Scene | g.E;
		timeline: Timeline;
		profile: CharacterProfile;
		spawnPoint: g.CommonOffset;
		spawnDirection: g.CommonOffset;
		movableArea: g.CommonArea;
	}) {
		this._profile = params.profile;
		this._timeline = params.timeline;
		this._speed = params.profile.speed;

		const scale = params.profile.sizeScale ?? 1.0;

		if (!isUnitVector(params.spawnDirection)) {
			throw new Error("spawnDirection must be a unit vector");
		}
		this._movingDirection = params.spawnDirection;

		const root = new g.E({
			scene: params.scene,
			x: params.spawnPoint.x,
			y: params.spawnPoint.y,
			touchable: false,
			parent: params.parent ?? params.scene,
		});
		this._rootEntity = root;

		const image = params.profile.activeSprite;
		const sprite = new g.Sprite({
			scene: params.scene,
			src: image,
			width: image.width,
			height: image.height,
			touchable: false,
			parent: root,
			x: 0,
			y: 0,
			anchorX: 0.5,
			anchorY: 0.5,
			scaleX: scale,
			scaleY: scale,
		});
		this._spriteEntity = sprite;

		this._collider = {
			x: (params.profile.collisionSize?.x ?? 0) * scale,
			y: (params.profile.collisionSize?.y ?? 0) * scale,
			width: (params.profile.collisionSize?.width ?? image.width) * scale,
			height: (params.profile.collisionSize?.height ?? image.height) * scale,
		};
		const grabArea = {
			x: (params.profile.grabSize?.x ?? 0) * scale,
			y: (params.profile.grabSize?.y ?? 0) * scale,
			width: (params.profile.grabSize?.width ?? image.width) * scale,
			height: (params.profile.grabSize?.height ?? image.height) * scale,
		};

		const constraintArea = {
			x: params.movableArea.x + grabArea.width * 0.5 - grabArea.x,
			y: params.movableArea.y + grabArea.height * 0.5 - grabArea.y,
			width: params.movableArea.width - grabArea.width,
			height: params.movableArea.height - grabArea.height,
		};
		const grabEntity = new GrabbableEntity({
			scene: params.scene,
			parent: root,
			size: grabArea,
			offset: grabArea,
			constraintArea: constraintArea,
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

		root.onUpdate.add(() => {
			if (this._grabEntity.grabbing) {
				return;
			}

			this.moving();
		});

		this.setPosition(params.spawnPoint);
	}

	public setNavigator(navigator: PositionNavigator | null): void {
		if (this._navigator === navigator) {
			return;
		}
		this._navigator = navigator;

		if (this._movingDirection.x === 0 && this._movingDirection.y === 0) {
			this.rerouteRandomPoint();
		} else {
			this.reroute();
		}
	}

	public setInteractable(isDraggable: boolean): void {
		this._spriteEntity.src = isDraggable
			? this._profile.activeSprite
			: this._profile.inactiveSprite;
		this._spriteEntity.invalidate();

		this._grabEntity.grabbable = isDraggable;
	}

	public destroy(): void {
		this._currentMoving?.cancel();
		this._rootEntity.hide();
		// onPointDown等の処理中に破棄されると、画像の描画キャッシュが残ってしまいレンダリング時にエラーが発生する為、ここで破棄しておく
		this._spriteEntity.invalidate();
		this._rootEntity.destroy();
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

		// 現在の座標から目的地までの距離を計算
		const currentPoint = this.currentPoint;
		const distanceX = nextPoint.x - currentPoint.x;
		const distanceY = nextPoint.y - currentPoint.y;
		const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

		// 移動にかかる時間を計算
		const duration = (distance / this._speed) * 1000;

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
				top: this._collider.height * 0.5 - this._collider.y,
				left: this._collider.width * 0.5 - this._collider.x,
				right: this._collider.width * 0.5 + this._collider.x,
				bottom: this._collider.height * 0.5 + this._collider.y,
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
}

function isUnitVector(v: g.CommonOffset, epsilon: number = 1e-10): boolean {
	const length = Math.sqrt(v.x ** 2 + v.y ** 2);
	return Math.abs(length - 1) < epsilon;
}
