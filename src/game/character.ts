import { Tween, Timeline } from "@akashic-extension/akashic-timeline";

export interface CharacterProfile {
    sprite: g.ImageAsset,
    goalAreaId: string,
}

export interface CharacterParameterObject {
    name?: string
    scene: g.Scene
    parent?: g.Scene | g.E
    timeline: Timeline
    profile: CharacterProfile
}

export interface PointEvent {
    point: g.CommonOffset
}

export interface PointMoveEvent extends PointEvent {
    prevDelta: g.CommonOffset
}

export class Character {
    public onPointDown: ((ev: PointEvent) => void) | null = null;
    public onPointMove: ((ev: PointMoveEvent) => void) | null = null;
    public onPointUp: ((ev: PointEvent) => void) | null = null;

    private readonly _entity: g.Sprite;
    private _isTouching = false;
    private _currentMoving: Tween | null = null;

    public get entity(): g.E {
        return this._entity;
    }

    public constructor(params: CharacterParameterObject) {
        const sprite = params.profile.sprite;
        const entity = new g.Sprite({
            scene: params.scene,
            src: sprite,
            width: sprite.width,
            height: sprite.height,
            touchable: true,
            local: true,
        });
        entity.scale(1.5);
        this._entity = entity;

        entity.onPointDown.add(this.handlePointDownEvent.bind(this));
        entity.onPointMove.add(this.handlePointMoveEvent.bind(this));
        entity.onPointUp.add(this.handlePointUpEvent.bind(this));

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

    private handlePointDownEvent(ev: PointEvent):void {
        if (!this._entity.touchable) {
            return;
        }

        this._isTouching = true;
        this._currentMoving?.cancel();

        this.onPointDown?.({point: this._entity.localToGlobal(ev.point)});
    }

    private handlePointMoveEvent(ev: PointMoveEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._entity.x += ev.prevDelta.x;
        this._entity.y += ev.prevDelta.y;
        this._entity.modified();

        this.onPointMove?.({point: this._entity.localToGlobal(ev.point), prevDelta: ev.prevDelta});
    }

    private handlePointUpEvent(ev: PointEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._isTouching = false;

        this.onPointUp?.({point: this._entity.localToGlobal(ev.point)});
    }

    public setInteractable(isDraggable: boolean): void {
        this._entity.touchable = isDraggable;
        this._entity.opacity = isDraggable ? 1 : 0.5;
        this._entity.invalidate();
        if(this._isTouching) {
            const point = this._entity.localToGlobal({ x: 0, y: 0 });
            this.handlePointUpEvent({ point: point });
        }
    }
}
