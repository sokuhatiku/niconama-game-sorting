import type { PointUpEvent } from "@akashic/akashic-engine";

export interface PointEvent {
	point: g.CommonOffset;
}

export interface PointMoveEvent extends PointEvent {
	prevDelta: g.CommonOffset;
	startDelta: g.CommonOffset;
}

export class GrabbableEntity {
	private readonly _entity: g.E;
	private readonly _constraintArea: g.CommonArea;
	private readonly _moveCallback: (worldPoint: g.CommonOffset) => void;

	private _grabbing: boolean = false;
	private _startGlobalPoint: g.CommonOffset = { x: 0, y: 0 };
	private _prevGlobalDelta: g.CommonOffset = { x: 0, y: 0 };
	private _startGlobalDelta: g.CommonOffset = { x: 0, y: 0 };
	private _prevGlobalPoint: g.CommonOffset = { x: 0, y: 0 };

	private readonly _pointDownTrigger: g.Trigger<PointEvent> =
		new g.Trigger<PointEvent>();
	private readonly _pointMoveTrigger: g.Trigger<PointMoveEvent> =
		new g.Trigger<PointMoveEvent>();
	private readonly _pointUpTrigger: g.Trigger<PointEvent> =
		new g.Trigger<PointEvent>();

	public get grabbing(): boolean {
		return this._grabbing;
	}

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
		parent: g.E;
		size: g.CommonSize;
		offset: g.CommonOffset;
		constraintArea: g.CommonArea;
		moveCallback: (worldPoint: g.CommonOffset) => void;
	}) {
		this._constraintArea = params.constraintArea;
		this._moveCallback = params.moveCallback;
		const entity = new g.FilledRect({
			scene: params.scene,
			width: params.size.width,
			height: params.size.height,
			x: params.offset.x,
			y: params.offset.y,
			anchorX: 0.5,
			anchorY: 0.5,
			touchable: true,
			cssColor: "rgba(255, 0, 0, 1)",
			opacity: 0,
			parent: params.parent,
		});
		this._entity = entity;

		entity.onPointDown.add(this.handlePointDown.bind(this), this);
		entity.onPointMove.add(this.handlePointMove.bind(this), this);
		entity.onPointUp.add(this.handlePointUp.bind(this), this);
	}

	private handlePointDown(ev: PointEvent): void {
		if (this._grabbing) {
			return;
		}

		this._grabbing = true;

		const globalPoint = this._entity.localToGlobal(ev.point);
		this._startGlobalPoint = globalPoint;
		this._prevGlobalPoint = globalPoint;
		this._prevGlobalDelta = { x: 0, y: 0 };
		this._startGlobalDelta = { x: 0, y: 0 };
		this.setRootEntityPosition(globalPoint);

		this._pointDownTrigger.fire({ point: globalPoint });
	}

	private handlePointMove(ev: PointMoveEvent): void {
		if (!this._grabbing) {
			return;
		}

		const globalPoint = this.applyConstraintArea({
			x: this._startGlobalPoint.x + ev.startDelta.x,
			y: this._startGlobalPoint.y + ev.startDelta.y,
		});
		this.setRootEntityPosition(globalPoint);

		this._startGlobalDelta = {
			x: globalPoint.x - this._startGlobalPoint.x,
			y: globalPoint.y - this._startGlobalPoint.y,
		};

		this._prevGlobalDelta = {
			x: globalPoint.x - this._prevGlobalPoint.x,
			y: globalPoint.y - this._prevGlobalPoint.y,
		};

		this._prevGlobalPoint = globalPoint;

		this._pointMoveTrigger.fire({
			point: globalPoint,
			prevDelta: this._prevGlobalDelta,
			startDelta: this._startGlobalDelta,
		});
	}

	private applyConstraintArea(globalPoint: g.CommonOffset): g.CommonOffset {
		const x = Math.min(
			Math.max(globalPoint.x, this._constraintArea.x),
			this._constraintArea.x + this._constraintArea.width,
		);
		const y = Math.min(
			Math.max(globalPoint.y, this._constraintArea.y),
			this._constraintArea.y + this._constraintArea.height,
		);
		return { x, y };
	}

	private handlePointUp(_ev: PointUpEvent): void {
		if (!this._grabbing) {
			return;
		}

		this._grabbing = false;

		this._pointUpTrigger.fire({ point: this._prevGlobalPoint });
	}

	private setRootEntityPosition(worldPoint: g.CommonOffset): void {
		this._moveCallback(worldPoint);
	}

	public get grabbable(): boolean {
		return this._entity.touchable;
	}

	public set grabbable(value: boolean) {
		if (this._entity.touchable === value) {
			return;
		}
		this._entity.touchable = value;
		if (!value && this._grabbing) {
			this._grabbing = false;

			this._pointUpTrigger.fire({ point: this._prevGlobalPoint });
		}
	}
}
