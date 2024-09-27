import { Tween, Timeline } from "@akashic-extension/akashic-timeline";

export type CharacterCreateParams = {
	name?: string;
	scene: g.Scene;
	parent?: g.Scene | g.E;
	timeline: Timeline;
	sprite: g.ImageAsset;
};

export class Character {
	private _entity: g.Sprite;
	private _isTouching: boolean = false;
	private _currentMoving: Tween = null;
	private _handlingPlayer: string = null;

	get entity(): g.E {
		return this._entity;
	}

	public onPointDown?: (ev: g.PointDownEvent) => void = null;
	public onPointMove?: (ev: g.PointMoveEvent) => void = null;
	public onPointUp?: (ev: g.PointUpEvent) => void = null;

	constructor(params: CharacterCreateParams) {
		const entity = new g.Sprite({
			scene: params.scene,
			src: params.sprite,
			width: params.sprite.width,
			height: params.sprite.height,
			touchable: true,
			local: true
		});
		this._entity = entity;

		entity.onPointDown.add((ev) => {
			if (this._handlingPlayer) {
				return;
			}
			console.log(params.name, "touched by", ev.player.id);
			this._handlingPlayer = ev.player.id;
			this._isTouching = true;
			this._currentMoving?.cancel();

			this.onPointDown?.(ev);
		});

		entity.onPointMove.add((ev) => {
			if (ev.player.id !== this._handlingPlayer) {
				return;
			}

			entity.x += ev.prevDelta.x;
			entity.y += ev.prevDelta.y;
			entity.modified();

			this.onPointMove?.(ev);
		});

		entity.onPointUp.add((ev) => {
			if (ev.player.id !== this._handlingPlayer) {
				return;
			}

			this._handlingPlayer = null;
			this._isTouching = false;

			this.onPointUp?.(ev);
		});

		entity.onUpdate.add(() => {
			if (this._isTouching) {
				return;
			}

			if (this._currentMoving && !this._currentMoving.isFinished()) {
				return;
			}

			// 1秒あたりの移動距離(px)
			const speed = 100;

			// 移動先の座標をランダムに決定
			const parent = entity.parent;
			const spaceWidth = (parent instanceof g.E ? parent.width : g.game.width) - entity.width;
			const spaceHeight = (parent instanceof g.E ? parent.height : g.game.height) - entity.height;
			const targetX = Math.floor(g.game.random.generate() * spaceWidth);
			const targetY = Math.floor(g.game.random.generate() * spaceHeight);

			// 現在の座標から目的地までの距離を計算
			const distanceX = targetX - entity.x;
			const distanceY = targetY - entity.y;
			const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

			// 移動にかかる時間を計算
			const duration = distance / speed * 1000;

			// 移動アニメーションを開始
			this._currentMoving = params.timeline.create(entity).moveTo(targetX, targetY, duration);

		});

		if (params.parent) {
			params.parent.append(entity);
		}
	}
}
