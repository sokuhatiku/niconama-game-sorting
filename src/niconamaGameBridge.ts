interface GameState {
	score: number;
	playThreshold: number;
}

export class NiconamaGameBridge {
	public get score(): number {
		return this._gameState.score;
	}

	public constructor() {
		this._gameState = {
			score: 0,
			playThreshold: 0,
		};
	}

	public noticeScore(point: number): void {
		this._gameState.score = point;
	}

	private get _gameState(): GameState {
		return (g.game.vars as { gameState: GameState }).gameState;
	}
	private set _gameState(state: GameState) {
		(g.game.vars as { gameState: GameState }).gameState = state;
	}
}
