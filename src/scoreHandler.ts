export interface ScoreHandler {
    notice(point: number): void
    get score(): number
}

export function createScoreHandler(): ScoreHandler {
    return new ScoreHandlerImpl();
}

interface GameState { 
    score: number
    playThreshold: number
}

class ScoreHandlerImpl implements ScoreHandler {
    private _score = 0;

    public get score(): number {
        return this._score;
    }

    public constructor() {
        (g.game.vars as { gameState: GameState }).gameState = {
            score: 0,
            playThreshold: 0,
        };
    }

    public notice(point: number): void {
        this._score = point;

        (g.game.vars as { gameState: GameState }).gameState = {
            score: 0,
            playThreshold: 0,
        };
    }
}
