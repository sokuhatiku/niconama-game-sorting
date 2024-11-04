import type { GameCore } from "../game/gameCore";
import type { Phase } from ".";

export class GamePhase implements Phase {
	public readonly name: string = "game";

	private readonly _gameCore: GameCore;

	public constructor(params: { gameCore: GameCore }) {
		this._gameCore = params.gameCore;
	}

	public enter(): void {
		this._gameCore.setActive(true);
	}
	public update(): void {
		this._gameCore.update();
	}
	public exit(): void {
		this._gameCore.setActive(false);
	}
}
