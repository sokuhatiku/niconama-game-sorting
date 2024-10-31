import { Vector } from "../utils/raycast";

export interface GetNextPositionParameterObject {
	startPosition: g.CommonOffset;
	startDirection: g.CommonOffset;
	maxDistance: number;
	rect: g.CommonRect;
}

export interface PositionNavigator {
	getRandomPoint(rect: g.CommonRect): g.CommonOffset;
	/**
	 * 指定した位置から指定した方向に指定した距離だけ進んだときの経路を取得します
	 * @returns 進んだ経路の座標リスト
	 */
	getNextPath(params: GetNextPositionParameterObject): g.CommonOffset[];
	containsPoint(point: g.CommonOffset): boolean;
}

export function normalize(offset: Vector): Vector {
	const length = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
	return { x: offset.x / length, y: offset.y / length };
}

export function scale(offset: Vector, scale: number): Vector {
	return { x: offset.x * scale, y: offset.y * scale };
}

export function add(a: Vector, b: Vector): Vector {
	return { x: a.x + b.x, y: a.y + b.y };
}
