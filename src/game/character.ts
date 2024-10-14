import { Tween, Timeline } from "@akashic-extension/akashic-timeline";
import { PositionNavigator } from "./positionNavigator";

export interface CharacterProfile {
    sprite: g.ImageAsset,
    goalAreaId: string,
}

export interface PointEvent {
    point: g.CommonOffset
}

export interface PointMoveEvent extends PointEvent {
    prevDelta: g.CommonOffset
}

export class Character {
    private readonly _pointDownTrigger: g.Trigger<PointEvent> = new g.Trigger<PointEvent>();
    private readonly _pointMoveTrigger: g.Trigger<PointMoveEvent> = new g.Trigger<PointMoveEvent>();
    private readonly _pointUpTrigger: g.Trigger<PointEvent> = new g.Trigger<PointEvent>();
    private readonly _timeline: Timeline;
    private _navPoints: g.CommonOffset[] = [];
    private _movingDirection: g.CommonOffset = { x: 0, y: 0 };
    private _navigator: PositionNavigator | null = null;

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
    private readonly _entity: g.Sprite;
    private _isTouching = false;
    private _currentMoving: Tween | null = null;

    public get entity(): g.E {
        return this._entity;
    }

    public get profile(): CharacterProfile {
        return this._profile;
    }

    public constructor(params: {
        scene: g.Scene
        parent?: g.Scene | g.E
        timeline: Timeline
        profile: CharacterProfile
        spawnPoint: g.CommonOffset
        firstMoveDestination: g.CommonOffset
    }) {
        this._profile = params.profile;
        this._timeline = params.timeline;
        const sprite = params.profile.sprite;
        const entity = new g.Sprite({
            scene: params.scene,
            src: sprite,
            width: sprite.width,
            height: sprite.height,
            touchable: true,
            local: true,
            parent: params.parent ?? params.scene,
        });
        
        this._entity = entity;

        entity.onPointDown.add(this.handlePointDownEvent.bind(this));
        entity.onPointMove.add(this.handlePointMoveEvent.bind(this));
        entity.onPointUp.add(this.handlePointUpEvent.bind(this));

        entity.onUpdate.add(() => {
            if (this._isTouching) {
                return;
            }

            this.moving();
        });

        this.setPosition(params.spawnPoint);
        this._navPoints.push(params.firstMoveDestination);
    }

    private moving(): void {
        // 現在の移動処理が終了していない場合は何もしない
        if (this._currentMoving && !this._currentMoving.isFinished()) {
            return;
        }

        // 次の移動先を取得
        const nextPoint = this._navPoints.shift();

        if(!nextPoint){
            // 移動先がない場合はルートを再作成
            this.reRoute();
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
        const duration = distance / speed * 1000;

        // 移動方向を計算
        this._movingDirection = { x: distanceX / distance, y: distanceY / distance };

        // 移動アニメーションを開始
        this._currentMoving = this.createMoveTween(nextPoint, duration);
    }

    private get currentPoint(): g.CommonOffset {
        return this._entity.localToGlobal({ x: 0, y: 0 });
    }

    private createMoveTween(point: g.CommonOffset, duration:number): Tween {
        // tweenを作る際には親のローカル座標での移動になるため変換が必要
        const localPoint = (this._entity.parent instanceof g.E) ? this._entity.parent.globalToLocal(point) : point;
        return this._timeline.create(this._entity).moveTo(localPoint.x, localPoint.y, duration);
    }

    private setPosition(point: g.CommonOffset): void {
        const localPoint = (this._entity.parent instanceof g.E) ? this._entity.parent.globalToLocal(point) : point;
        this._entity.moveTo(localPoint.x, localPoint.y);
        this._entity.modified();
    }

    private reRoute(): void {
        if (!this._navigator) {
            return;
        }

        const pos = this._entity.localToGlobal({ x: 0, y: 0 });
        this._navPoints = this._navigator.getNextPath(pos, this._movingDirection, 1000);
    }

    private handlePointDownEvent(ev: PointEvent):void {
        if (!this._entity.touchable) {
            return;
        }

        this._isTouching = true;
        this._currentMoving?.cancel();

        this._pointDownTrigger.fire({point: this._entity.localToGlobal(ev.point)});
    }

    private handlePointMoveEvent(ev: PointMoveEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._entity.x += ev.prevDelta.x;
        this._entity.y += ev.prevDelta.y;
        this._entity.modified();

        this._pointMoveTrigger.fire({point: this._entity.localToGlobal(ev.point), prevDelta: ev.prevDelta});
    }

    private handlePointUpEvent(ev: PointEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._isTouching = false;

        this._pointUpTrigger.fire({point: this._entity.localToGlobal(ev.point)});
    }

    public setNavigator(navigator: PositionNavigator | null): void {
        this._navigator = navigator;
        if (navigator){
            // 範囲内のランダムな位置に移動するように設定
            this._navPoints = [navigator.getRandomPoint()];
        }
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

    public destroy(): void {
        this._currentMoving?.cancel();
        this._entity.destroy();
    }
}
