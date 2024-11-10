import { AssetLoader } from "../assetLoader";
import type { GameCore } from "../game/gameCore";
import type { Scoreboard } from "../game/scoreboard";
import type { Phase } from ".";

export class GamePhase implements Phase {
	public readonly name: string = "game";

	private readonly _gameCore: GameCore;
	private readonly _scoreboard: Scoreboard;
	private readonly _startSound: g.AudioAsset;

	public constructor(params: {
		scene: g.Scene;
		gameCore: GameCore;
		scoreboard: Scoreboard;
	}) {
		this._gameCore = params.gameCore;
		this._scoreboard = params.scoreboard;
		this._scoreboard.entity.hide();

		const assetLoader = new AssetLoader(params.scene);
		this._startSound = assetLoader.getAudio("/audio/whistle_start");
	}

	public enter(): void {
		this._gameCore.setActive(true);
		this._scoreboard.entity.show();
		this._startSound.play();
	}
	public update(): void {
		this._gameCore.update();
	}
	public exit(): void {
		this._gameCore.setActive(false);
		this._scoreboard.entity.hide();
	}
}
