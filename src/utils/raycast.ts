export interface Vector {
    x: number;
    y: number;
}

export interface Line {
    start: Vector; // 線分の始点
    end: Vector; // 線分の終点
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
 */
export function raycastLines(lines: readonly Line[], ray: Ray, distance: number): RaycastHit | null {
    let closestHit: RaycastHit | null = null;

    for (const line of lines) {
        const hit = raycastLine(line, ray, distance);
        if(!hit) continue;
        if(!closestHit || hit.distance < closestHit.distance) {
            closestHit = hit;
        }
    }

    return closestHit;
}

/**
 * 線分に対してレイキャストを行い、衝突点を返します。
 * 衝突しなかった場合はnullを返します。
 */
export function raycastLine(line: Line, ray: Ray, distance: number): RaycastHit | null {
    const { start, end } = line;
    const { position, direction } = ray;

    const lineDir = { x: end.x - start.x, y: end.y - start.y };
    const lineLength = Math.sqrt(lineDir.x * lineDir.x + lineDir.y * lineDir.y);
    const normalizedLineDir = { x: lineDir.x / lineLength, y: lineDir.y / lineLength };

    const denominator = direction.x * normalizedLineDir.y - direction.y * normalizedLineDir.x;
    if (Math.abs(denominator) < 1e-6) {
        return null; // 平行な場合
    }

    const t = ((start.x - position.x) * normalizedLineDir.y - (start.y - position.y) * normalizedLineDir.x) / denominator;
    const u = ((start.x - position.x) * direction.y - (start.y - position.y) * direction.x) / denominator;

    if (t >= 0 && t <= distance && u >= 0 && u <= lineLength) {
        const hitPosition = { x: position.x + t * direction.x, y: position.y + t * direction.y };
        const hitDistance = t;
        const hitNormal = { x: -normalizedLineDir.y, y: normalizedLineDir.x };
        return { position: hitPosition, distance: hitDistance, normal: hitNormal };
    }

    return null;
}
