import type { GameCore } from "../game/gameCore";
import type { Scoreboard } from "../game/scoreboard";
import type { Phase } from ".";

export class GamePhase implements Phase {
	public readonly name: string = "game";

	private readonly _gameCore: GameCore;
	private readonly _scoreboard: Scoreboard;

	public constructor(params: {
		gameCore: GameCore;
		scoreboard: Scoreboard;
	}) {
		this._gameCore = params.gameCore;
		this._scoreboard = params.scoreboard;
		this._scoreboard.entity.hide();
	}

	public enter(): void {
		this._gameCore.setActive(true);
		this._scoreboard.entity.show();
	}
	public update(): void {
		this._gameCore.update();
	}
	public exit(): void {
		this._gameCore.setActive(false);
		this._scoreboard.entity.hide();
	}
}
