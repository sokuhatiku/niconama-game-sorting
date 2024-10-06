export interface ScoreHandler {
    set(point: number): void
    get score(): number
}

export function createScoreHandler(): ScoreHandler {
    return new ScoreHandlerImpl()
}

class ScoreHandlerImpl implements ScoreHandler {
    private _score: number = 0

    get score(): number {
        return this._score
    }

    constructor() {
        g.game.vars.gameState = {
            ...g.game.vars.gameState,
            score:0,
        }
    }

    set(point: number): void {
        this._score = point
        g.game.vars.gameState.score = this._score
    }
}
