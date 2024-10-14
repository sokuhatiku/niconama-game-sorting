import { RectNavigator } from "../src/game/positionNavigator";

describe("RectNavigator", () => {
    describe("getNextPath", () => {
        it("進路上に障害物がない場合はまっすぐ進んだ結果を返す", () => {
            const rect = { x: 0, y: 0, width: 100, height: 100 };
            const navigator = new RectNavigator(rect);
            const startPosition = { x: 10, y: 10 };
            const startDirection = { x: 1, y: 0 };
            const maxDistance = 50;

            const path = navigator.getNextPath({
                startPosition:startPosition,
                startDirection:startDirection,
                maxDistance:maxDistance, 
                rect:{top:0, left:0, right:0, bottom:0}});

            expect(path).toEqual([
                { x: 60, y: 10 }
            ]);
        });

        it("進路上に障害物があった場合は衝突点と折り返して到達した点を返す", () => {
            const rect = { x: 0, y: 0, width: 100, height: 100 };
            const navigator = new RectNavigator(rect);
            const startPosition = { x: 10, y: 10 };
            const startDirection = { x: 1, y: 0 };
            const maxDistance = 100;

            const path = navigator.getNextPath({
                startPosition:startPosition,
                startDirection:startDirection,
                maxDistance:maxDistance, 
                rect:{top:0, left:0, right:0, bottom:0}});

            expect(path).toEqual([
                { x: 100, y: 10 },
                { x: 90, y: 10 }
            ]);
        });

        it("should return the correct path when hitting multiple obstacles", () => {
            const rect = { x: 0, y: 0, width: 100, height: 100 };
            const navigator = new RectNavigator(rect);
            const startPosition = { x: 10, y: 10 };
            const startDirection = { x: 1, y: 1 };
            const maxDistance = 200;

            const path = navigator.getNextPath({
                startPosition:startPosition,
                startDirection:startDirection,
                maxDistance:maxDistance, 
                rect:{top:0, left:0, right:0, bottom:0}});

            expect(path.length).toBeGreaterThan(1);
        });

        it("should return the correct path when maxDistance is zero", () => {
            const rect = { x: 0, y: 0, width: 100, height: 100 };
            const navigator = new RectNavigator(rect);
            const startPosition = { x: 10, y: 10 };
            const startDirection = { x: 1, y: 0 };
            const maxDistance = 0;

            const path = navigator.getNextPath({
                startPosition:startPosition,
                startDirection:startDirection,
                maxDistance:maxDistance, 
                rect:{top:0, left:0, right:0, bottom:0}});
                
            expect(path).toEqual([]);
        });
    });
});