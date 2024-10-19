import { Tween, Timeline } from "@akashic-extension/akashic-timeline";
import { PositionNavigator } from "./positionNavigator";

export interface CharacterProfile {
    /**
     * キャラクターのスプライト画像
     */
    activeSprite: g.ImageAsset,
    /**
     * キャラクターが非アクティブ状態の差分スプライト画像
     */
    inactiveSprite: g.ImageAsset,
    /**
     * キャラクターの当たり判定は与えられたスプライトに依存しますが、この値を使って当たり判定の範囲を調整できます。
     */
    grabSizeOffset: g.CommonRect,
    /**
     * 配置されると得点になるエリアのID
     */
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
    private readonly _rootEntity: g.Sprite;
    private readonly _gragEntity: g.FilledRect;
    private _isTouching = false;
    private _currentMoving: Tween | null = null;

    public get entity(): g.E {
        return this._rootEntity;
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
    }) {
        this._profile = params.profile;
        this._timeline = params.timeline;
        const sprite = params.profile.activeSprite;
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

        const grabOffset = params.profile.grabSizeOffset;
        const grabEntity = new g.FilledRect({
            scene: params.scene,
            x: 0 - grabOffset.left,
            y: 0 - grabOffset.top,
            width: sprite.width + grabOffset.left + grabOffset.right,
            height: sprite.height + grabOffset.top + grabOffset.bottom,
            cssColor: "rgba(255, 0, 0, 0)",
            opacity: 0,
            touchable: true,
            local: true,
            parent: entity,
        });
        this._gragEntity = grabEntity;

        grabEntity.onPointDown.add(this.handlePointDownEvent.bind(this));
        grabEntity.onPointMove.add(this.handlePointMoveEvent.bind(this));
        grabEntity.onPointUp.add(this.handlePointUpEvent.bind(this));

        entity.onUpdate.add(() => {
            if (this._isTouching) {
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
            this.reRoute();
        }

        // 次の移動先を取得
        const nextPoint = this._navPoints.shift();

        if(!nextPoint){
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
        return this._rootEntity.localToGlobal({ x: 0, y: 0 });
    }

    private createMoveTween(point: g.CommonOffset, duration:number): Tween {
        // tweenを作る際には親のローカル座標での移動になるため変換が必要
        const localPoint = (this._rootEntity.parent instanceof g.E) ? this._rootEntity.parent.globalToLocal(point) : point;
        return this._timeline.create(this._rootEntity).moveTo(localPoint.x, localPoint.y, duration);
    }

    private setPosition(point: g.CommonOffset): void {
        const localPoint = (this._rootEntity.parent instanceof g.E) ? this._rootEntity.parent.globalToLocal(point) : point;
        this._rootEntity.moveTo(localPoint.x, localPoint.y);
        this._rootEntity.modified();
    }

    private reRoute(): void {
        if (!this._navigator) {
            return;
        }

        const pos = this._rootEntity.localToGlobal({ x: 0, y: 0 });
        this._navPoints = this._navigator.getNextPath({
            startPosition: { x: pos.x, y: pos.y },
            startDirection: this._movingDirection,
            maxDistance: 300,
            rect: { top: 0, left: 0, right: this._rootEntity.width, bottom: this._rootEntity.height }
        });
    }

    private handlePointDownEvent(ev: PointEvent):void {
        if (!this._gragEntity.touchable) {
            return;
        }

        this._isTouching = true;
        this._currentMoving?.cancel();

        this._pointDownTrigger.fire({point: this._gragEntity.localToGlobal(ev.point)});
    }

    private handlePointMoveEvent(ev: PointMoveEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._rootEntity.x += ev.prevDelta.x;
        this._rootEntity.y += ev.prevDelta.y;
        this._rootEntity.modified();

        this._pointMoveTrigger.fire({point: this._rootEntity.localToGlobal(ev.point), prevDelta: ev.prevDelta});
    }

    private handlePointUpEvent(ev: PointEvent): void {
        if (!this._isTouching) {
            return;
        }

        this._isTouching = false;

        this._pointUpTrigger.fire({point: this._rootEntity.localToGlobal(ev.point)});
    }

    public setNavigator(navigator: PositionNavigator | null): void {
        this._navigator = navigator;
        if (navigator){
            // 範囲内のランダムな位置に移動するように設定
            this._navPoints = [navigator.getRandomPoint({ top: 0, left: 0, right: this._rootEntity.width, bottom: this._rootEntity.height })];
        }
    }

    public setInteractable(isDraggable: boolean): void {
        this._gragEntity.touchable = isDraggable;
        this._rootEntity.src = isDraggable ? this._profile.activeSprite : this._profile.inactiveSprite;
        this._rootEntity.invalidate();

        if(!isDraggable && this._isTouching) {
            const point = this._rootEntity.localToGlobal({ x: 0, y: 0 });
            this.handlePointUpEvent({ point: point });
        }
    }

    public destroy(): void {
        this._currentMoving?.cancel();
        this._rootEntity.destroy();
    }
}
