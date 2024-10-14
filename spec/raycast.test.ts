import { raycastLine, Line, Ray } from "../src/utils/raycast";

describe("raycastLine", () => {
    it("光線が直線に平行な場合はnullを返す", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
        };
        const ray: Ray = {
            position: { x: 0, y: 1 },
            direction: { x: 1, y: 0 },
        };
        const distance = 10;

        const result = raycastLine(line, ray, distance);
        expect(result).toBeNull();
    });

    it("指定された距離内に線分が無い場合はnullを返す", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
        };
        const ray: Ray = {
            position: { x: 0, y: 1 },
            direction: { x: 0, y: -1 },
        };
        const distance = 0.5;

        const result = raycastLine(line, ray, distance);
        expect(result).toBeNull();
    });

    it("レイが線分と交差したときは正しいRaycastHitを返す", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
        };
        const ray: Ray = {
            position: { x: 5, y: 5 },
            direction: { x: 0, y: -1 },
        };
        const distance = 10;

        const result = raycastLine(line, ray, distance);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.position).toEqual({ x: 5, y: 0 });
            expect(result.distance).toBeCloseTo(5);
            expect(result.normal).toEqual({ x: -0, y: 1 });
        }
    });

    it("レイが線分上で開始した場合も衝突する", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
        };
        const ray: Ray = {
            position: { x: 5, y: 0 },
            direction: { x: 0, y: 1 },
        };
        const distance = 10;

        const result = raycastLine(line, ray, distance);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.position).toEqual({ x: 5, y: 0 });
            expect(result.distance).toBeCloseTo(0);
            expect(result.normal).toEqual({ x: -0, y: 1 });
        }
    });

    it("斜めのレイと線分が45度の角度で交差する場合", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 },
        };

        const sqrt = Math.sqrt(2);
        const ray: Ray = {
            position: { x: 0, y: -5 },
            direction: { x: 1/sqrt, y: 1/sqrt },
        };
        const distance = 10;

        const result = raycastLine(line, ray, distance);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.position).toEqual({ x: 5, y: 0 });
            expect(result.distance).toBeCloseTo(5 * sqrt);
            expect(result.normal).toEqual({ x: -0, y: 1 });
        }
    });

    it("レイと斜めの線分が45度の角度で交差する場合", () => {
        const line: Line = {
            start: { x: 0, y: 0 },
            end: { x: 10, y: 10 },
        };

        const ray: Ray = {
            position: { x: 5, y: 0 },
            direction: { x: 0, y: 1 },
        };
        const distance = 10;

        const result = raycastLine(line, ray, distance);
        expect(result).not.toBeNull();
        const sqrt = Math.sqrt(2);
        if (result) {
            expect(result.position).toEqual({ x: 5, y: 5 });
            expect(result.distance).toBeCloseTo(5);
            expect(result.normal).toEqual({ x: -1/sqrt, y: 1/sqrt });
        }
    });
});