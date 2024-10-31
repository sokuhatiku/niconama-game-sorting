export interface Vector {
	x: number;
	y: number;
}

export interface Line {
	start: Vector; // 線分の始点
	end: Vector; // 線分の終点
}

export interface Rect {
	top: number;
	left: number;
	right: number;
	bottom: number;
}

export interface Ray {
	position: Vector; // レイの始点
	direction: Vector; // レイの方向
}

interface RaycastHit {
	position: Vector; // 衝突点
	distance: number; // 衝突点までの距離
	normal: Vector; // 衝突点の法線ベクトル
}

/**
 * 複数の線分に対してレイキャストを行い、一番距離の近い衝突点を返します。
 * 衝突しなかった場合はnullを返します。
 * @param hasDirection 衝突判定を行う線分に向きを持たせます。向きを持たせた場合、レイが始点から見た線分に対して左側から来ている場合のみ衝突判定を行います。
 */
export function raycastLines(
	lines: readonly Line[],
	ray: Ray,
	distance: number,
	hasDirection?: boolean,
): RaycastHit | null {
	let closestHit: RaycastHit | null = null;

	for (const line of lines) {
		const hit = raycastLine(line, ray, distance, hasDirection);
		if (!hit) continue;
		if (!closestHit || hit.distance < closestHit.distance) {
			closestHit = hit;
		}
	}

	return closestHit;
}

/**
 * 線分に対してレイキャストを行い、衝突点を返します。
 * 衝突しなかった場合はnullを返します。
 * @param hasDirection 衝突判定を行う線分に向きを持たせます。向きを持たせた場合、レイが始点から見た線分に対して左側から来ている場合のみ衝突判定を行います。
 */
export function raycastLine(
	line: Line,
	ray: Ray,
	distance: number,
	hasDirection?: boolean,
): RaycastHit | null {
	const { start, end } = line;
	const { position, direction } = ray;

	const lineDir = { x: end.x - start.x, y: end.y - start.y };
	const lineLength = Math.sqrt(lineDir.x * lineDir.x + lineDir.y * lineDir.y);
	const normalizedLineDir = {
		x: lineDir.x / lineLength,
		y: lineDir.y / lineLength,
	};

	if (hasDirection) {
		// 線分の法線ベクトルを計算
		const normal = { x: -normalizedLineDir.y, y: normalizedLineDir.x };

		// レイの方向ベクトルと線分の法線ベクトルの内積を計算
		const dotProduct = direction.x * normal.x + direction.y * normal.y;

		// 内積が負の場合は、レイは線分の右側から来ているので衝突判定を行わない
		if (dotProduct < 0) {
			return null;
		}
	}

	const denominator =
		direction.x * normalizedLineDir.y - direction.y * normalizedLineDir.x;
	if (Math.abs(denominator) < 1e-6) {
		return null; // 平行な場合
	}

	const t =
		((start.x - position.x) * normalizedLineDir.y -
			(start.y - position.y) * normalizedLineDir.x) /
		denominator;
	const u =
		((start.x - position.x) * direction.y -
			(start.y - position.y) * direction.x) /
		denominator;

	if (t >= 0 && t <= distance && u >= 0 && u <= lineLength) {
		const hitPosition = {
			x: position.x + t * direction.x,
			y: position.y + t * direction.y,
		};
		const hitDistance = t;
		const hitNormal = { x: -normalizedLineDir.y, y: normalizedLineDir.x };
		return {
			position: hitPosition,
			distance: hitDistance,
			normal: hitNormal,
		};
	}

	return null;
}

export function rectRaycastLines(
	lines: readonly Line[],
	rect: Rect,
	ray: Ray,
	distance: number,
	hasDirection?: boolean,
): RaycastHit | null {
	let closestHit: RaycastHit | null = null;

	for (const line of lines) {
		const hit = rectRaycastLine(line, rect, ray, distance, hasDirection);
		if (!hit) continue;
		if (!closestHit || hit.distance < closestHit.distance) {
			closestHit = hit;
		}
	}

	return closestHit;
}

function distance(a: Vector, b: Vector): number {
	return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function rectRaycastLine(
	line: Line,
	rect: Rect,
	ray: Ray,
	maxDistance: number,
	hasDirection?: boolean,
): RaycastHit | null {
	let closestHit: RaycastHit | null = null;

	// 左上
	let offsetRay = {
		position: {
			x: ray.position.x - rect.left,
			y: ray.position.y - rect.top,
		},
		direction: ray.direction,
	};
	let hit = raycastLine(line, offsetRay, maxDistance, hasDirection);
	if (hit) {
		closestHit = {
			position: {
				x: hit.position.x + rect.left,
				y: hit.position.y + rect.top,
			}, // オフセットを打ち消す
			distance: distance(ray.position, hit.position), // 距離を再計算
			normal: hit.normal,
		};
	}

	// 右上
	offsetRay = {
		position: {
			x: ray.position.x + rect.right,
			y: ray.position.y - rect.top,
		},
		direction: ray.direction,
	};
	hit = raycastLine(line, offsetRay, maxDistance, hasDirection);
	if (hit && (!closestHit || hit.distance < closestHit.distance)) {
		closestHit = {
			position: {
				x: hit.position.x - rect.right,
				y: hit.position.y + rect.top,
			}, // オフセットを打ち消す
			distance: hit.distance,
			normal: hit.normal,
		};
	}

	// 左下
	offsetRay = {
		position: {
			x: ray.position.x - rect.left,
			y: ray.position.y + rect.bottom,
		},
		direction: ray.direction,
	};
	hit = raycastLine(line, offsetRay, maxDistance, hasDirection);
	if (hit && (!closestHit || hit.distance < closestHit.distance)) {
		closestHit = {
			position: {
				x: hit.position.x + rect.left,
				y: hit.position.y - rect.bottom,
			}, // オフセットを打ち消す
			distance: hit.distance,
			normal: hit.normal,
		};
	}

	// 右下
	offsetRay = {
		position: {
			x: ray.position.x + rect.right,
			y: ray.position.y + rect.bottom,
		},
		direction: ray.direction,
	};
	hit = raycastLine(line, offsetRay, maxDistance, hasDirection);
	if (hit && (!closestHit || hit.distance < closestHit.distance)) {
		closestHit = {
			position: {
				x: hit.position.x - rect.right,
				y: hit.position.y - rect.bottom,
			}, // オフセットを打ち消す
			distance: hit.distance,
			normal: hit.normal,
		};
	}

	return closestHit;
}
