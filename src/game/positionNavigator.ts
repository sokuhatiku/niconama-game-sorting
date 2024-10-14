import { Line, Rect, rectRaycastLines, Vector } from "../utils/raycast";

export interface GetNextPositionParameterObject {
    startPosition: g.CommonOffset;
    startDirection: g.CommonOffset;
    maxDistance: number;
    rect: g.CommonRect;
}

export interface PositionNavigator {
    getRandomPoint(): g.CommonOffset;
    /**
     * 指定した位置から指定した方向に指定した距離だけ進んだときの経路を取得します
     * @returns 進んだ経路の座標リスト
     */
    getNextPath(params: GetNextPositionParameterObject):g.CommonOffset[];
}

export class RectNavigator implements PositionNavigator {

    private readonly _rect: g.CommonArea;
    private readonly _segments: readonly Line[];
    
    public constructor(rect: g.CommonArea) {
        this._rect = rect;

        const extend = 5; // ギリギリの隙間を抜けられないようにするための線分に対する拡張
        // rectをセグメントに変換
        // 当たり判定を取る線分には向きを持たせるので、一筆書きで囲むように、線分の左側が内向きになるようにする
        this._segments = [
            {start: {x: rect.x + rect.width + extend, y: rect.y}, end: {x: rect.x - extend, y: rect.y}}, // top
            {start: {x: rect.x, y: rect.y - extend}, end: {x: rect.x, y: rect.y + rect.height + extend}}, // left
            {start: {x: rect.x + rect.width, y: rect.y + rect.height + extend}, end: {x: rect.x + rect.width, y: rect.y - extend}}, // right
            {start: {x: rect.x - extend, y: rect.y + rect.height}, end: {x: rect.x + rect.width + extend, y: rect.y + rect.height}}, // bottom
        ];
    }

    public getNextPath(params: GetNextPositionParameterObject): g.CommonOffset[] {        
        let totalDistance = 0;
        const points: g.CommonOffset[] = [];

        let pos:Vector = {x: params.startPosition.x, y:params.startPosition.y};
        let dir = normalize({x: params.startDirection.x, y: params.startDirection.y});
        const maxDistance = params.maxDistance;
        const rect:Rect = {top: params.rect.top, left: params.rect.left, right: params.rect.right, bottom: params.rect.bottom};
        
        while(totalDistance < maxDistance) {
            const hit = rectRaycastLines(this._segments, rect, {position: pos, direction: dir}, maxDistance - totalDistance, true);

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
            pos = hit.position;
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
