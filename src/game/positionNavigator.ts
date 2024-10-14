import { Line, raycastLines, Vector } from "../utils/raycast";

export interface PositionNavigator {
    getRandomPoint(): g.CommonOffset;
    /**
     * 指定した位置から指定した方向に指定した距離だけ進んだときの経路を取得します
     * @param position 開始位置（グローバル）
     * @param direction 進行方向（単位ベクトル）
     * @param distance 進む距離
     * @returns 進んだ経路の座標リスト
     */
    getNextPath(position:g.CommonOffset, direction:g.CommonOffset, distance: number):g.CommonOffset[];
}

export class RectNavigator implements PositionNavigator {

    private readonly _rect: g.CommonArea;
    private readonly _segments: readonly Line[];
    
    public constructor(rect: g.CommonArea) {
        this._rect = rect;

        const extend = 100; // ギリギリの隙間を抜けられないようにするための線分に対する拡張
        // rectをセグメントに変換
        this._segments = [
            {start: {x: rect.x - extend, y: rect.y}, end: {x: rect.x + rect.width + extend, y: rect.y}}, // top
            {start: {x: rect.x, y: rect.y - extend}, end: {x: rect.x, y: rect.y + rect.height + extend}}, // left
            {start: {x: rect.x + rect.width, y: rect.y - extend}, end: {x: rect.x + rect.width, y: rect.y + rect.height + extend}}, // right
            {start: {x: rect.x - extend, y: rect.y + rect.height}, end: {x: rect.x + rect.width + extend, y: rect.y + rect.height}}, // bottom
        ];
    }

    public getNextPath(startPosition: g.CommonOffset, startDirection: g.CommonOffset, maxDistance: number): g.CommonOffset[] {        
        let totalDistance = 0;
        const points: g.CommonOffset[] = [];

        let pos:Vector = {x: startPosition.x, y:startPosition.y};
        let dir = normalize({x: startDirection.x, y: startDirection.y});
        while(totalDistance < maxDistance) {
            const hit = raycastLines(this._segments, {position: pos, direction: dir}, maxDistance - totalDistance);

            // 当たらなかったらそれまでのポイントに残りの距離分移動したポイントを追加して終了
            if(hit == null) {
                const point = add(pos, scale(dir, maxDistance - totalDistance));
                points.push({x: point.x, y: point.y});
                break;
            }

            // 距離が超過した場合は、距離に収まるよう調整したポイントを追加して終了
            if(totalDistance + hit.distance >= maxDistance) {
                const point = add(pos, scale(dir, totalDistance + hit.distance - maxDistance));
                points.push({x: point.x, y: point.y});
                break;
            }

            // 衝突したポイントを追加し、次のレイキャストの位置と方向を計算して続行
            points.push({x: hit.position.x, y: hit.position.y});
            totalDistance += hit.distance;
            // 進行方向を法線に応じて反射させる
            const dot = dir.x * hit.normal.x + dir.y * hit.normal.y;
            dir = {x: dir.x - 2 * dot * hit.normal.x, y: dir.y - 2 * dot * hit.normal.y};
            const offset = scale(dir, 0.0001); // 同じ壁に衝突するのを防ぐため、進行方向にほんの少し進めておく
            totalDistance += 0.0001;
            pos = add(hit.position, offset);
        }

        console.log(points);
        return points;
    }

    public getRandomPoint(): g.CommonOffset {
        return {
            x: this._rect.x + g.game.random.generate() * this._rect.width,
            y: this._rect.y + g.game.random.generate() * this._rect.height,
        };
    }
}

function normalize(offset: Vector): Vector {
    const length = Math.sqrt(offset.x * offset.x + offset.y * offset.y);
    return {x: offset.x / length, y: offset.y / length};
}

function scale(offset: Vector, scale: number): Vector {
    return {x: offset.x * scale, y: offset.y * scale};
}

function add(a: Vector, b: Vector): Vector {
    return {x: a.x + b.x, y: a.y + b.y};
}
