import type { Line, Vector, Rect} from "../utils/raycast";
import { rectRaycastLines } from "../utils/raycast";
import type {
	PositionNavigator,
	GetNextPositionParameterObject} from "./positionNavigator";
import {
	normalize,
	add,
	scale,
} from "./positionNavigator";

export class PolygonNavigator implements PositionNavigator {
	private readonly _safeArea: g.CommonArea;
	private readonly _segments: readonly Line[];

	public constructor(
		polygon: readonly g.CommonOffset[],
		safeArea: g.CommonArea,
	) {
		this._safeArea = safeArea;

		this._segments = polygon.map((point, i) => {
			const next = polygon[(i + 1) % polygon.length];
			return { start: point, end: next };
		});
	}

	public containsPoint(point: g.CommonOffset): boolean {
		return (
			this._safeArea.x <= point.x &&
			this._safeArea.x + this._safeArea.width >= point.x &&
			this._safeArea.y <= point.y &&
			this._safeArea.y + this._safeArea.height >= point.y
		);
	}

	public getNextPath(
		params: GetNextPositionParameterObject,
	): g.CommonOffset[] {
		let totalDistance = 0;
		const points: g.CommonOffset[] = [];

		let pos: Vector = {
			x: params.startPosition.x,
			y: params.startPosition.y,
		};
		let dir = normalize({
			x: params.startDirection.x,
			y: params.startDirection.y,
		});
		const maxDistance = params.maxDistance;
		const rect: Rect = {
			top: params.rect.top,
			left: params.rect.left,
			right: params.rect.right,
			bottom: params.rect.bottom,
		};

		while (totalDistance < maxDistance) {
			const hit = rectRaycastLines(
				this._segments,
				rect,
				{ position: pos, direction: dir },
				maxDistance - totalDistance,
				true,
			);

			// 当たらなかったらそれまでのポイントに残りの距離分移動したポイントを追加して終了
			if (hit == null) {
				const point = add(pos, scale(dir, maxDistance - totalDistance));
				points.push({ x: point.x, y: point.y });
				break;
			}

			// 距離が超過した場合は、距離に収まるよう調整したポイントを追加して終了
			if (totalDistance + hit.distance >= maxDistance) {
				const point = add(
					pos,
					scale(dir, totalDistance + hit.distance - maxDistance),
				);
				points.push({ x: point.x, y: point.y });
				break;
			}

			// 衝突したポイントを追加し、次のレイキャストの位置と方向を計算して続行
			points.push({ x: hit.position.x, y: hit.position.y });
			totalDistance += hit.distance;
			// 進行方向を法線に応じて反射させる
			const dot = dir.x * hit.normal.x + dir.y * hit.normal.y;
			dir = {
				x: dir.x - 2 * dot * hit.normal.x,
				y: dir.y - 2 * dot * hit.normal.y,
			};
			pos = hit.position;
		}

		return points;
	}

	public getRandomPoint(rect: g.CommonRect): g.CommonOffset {
		return {
			x:
				this._safeArea.x +
				g.game.random.generate() *
					(this._safeArea.width - (rect.left + rect.right)) +
				rect.left,
			y:
				this._safeArea.y +
				g.game.random.generate() *
					(this._safeArea.height - (rect.top + rect.bottom)) +
				rect.top,
		};
	}
}
