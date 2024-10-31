import { Phase } from "../phase";
import { GameCore } from "./gameCore";

export class GamePhase implements Phase {
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
	public readonly name = "game";
}
