import { Timeline } from "@akashic-extension/akashic-timeline";
import { AppProgressBar } from "./appProgressBar";
import { allAssets, AssetLoader } from "./assetLoader";
import { GameCore } from "./game/gameCore";
import { GameScore } from "./game/gameScore";
import { Scoreboard } from "./game/scoreboard";
import { NiconamaGameBridge } from "./niconamaGameBridge";
import type { GameMainParameterObject } from "./parameterObject";
import { DescriptionPhase } from "./phases/descriptionPhase";
import { DoNothingPhase } from "./phases/doNothingPhase";
import { GamePhase } from "./phases/gamePhase";
import { ReadyPhase } from "./phases/readyPhase";
import { ResultPhase } from "./phases/resultPhase";
import { TitlePhase } from "./phases/titlePhase";
import { PhaseSequencer } from "./phaseSequencer";
import type { Layers } from "./utils/layers";

export function main(param: GameMainParameterObject): void {
	let applicationTimeLimit = Infinity;
	if (param.sessionParameter.totalTimeLimit) {
		applicationTimeLimit = param.sessionParameter.totalTimeLimit;
	}

	const niconama = new NiconamaGameBridge();
	const scene = new g.Scene({
		game: g.game,
		assetPaths: [...allAssets],
	});
	const assetLoader = new AssetLoader(scene);

	scene.onLoad.add(() => {
		const bgm = assetLoader.getAudio("/audio/bgm");
		const bgmPlay = bgm.play();
		// レイヤー
		const layers: Layers = {
			gameBackground: createLayerEntity(scene),
			gameForeground: createLayerEntity(scene),
			gamePickups: createLayerEntity(scene),
			gameParticles: createLayerEntity(scene),
			gameUi: createLayerEntity(scene),
			debugUi: createLayerEntity(scene),
		};

		// アニメーション用のタイムライン
		const timeline = new Timeline(scene);

		// スコア集計
		const scoreCounter = new GameScore();
		scoreCounter.onTotalScoreUpdated.add((score) => {
			niconama.noticeScore(score);
		});

		// ゲームロジック
		const gameCore = new GameCore({
			scene: scene,
			timeline: timeline,
			layers: layers,
			scoreCounter: scoreCounter,
		});

		const scoreboard = new Scoreboard({
			scene: scene,
			scoreCounter: scoreCounter,
		});

		const gamePhase = new GamePhase({
			gameCore: gameCore,
			scoreboard: scoreboard,
			scene: scene,
		});

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 64,
		});

		const titlePhase = new TitlePhase({
			scene: scene,
			font: font,
		});

		const descriptionPhase = new DescriptionPhase({
			scene: scene,
			font: font,
			layer: layers.gameUi,
		});

		const readyPhase = new ReadyPhase({
			scene: scene,
			font: font,
			layer: layers.gameUi,
		});

		const resultPhase = new ResultPhase({
			scene: scene,
			layer: layers.gameUi,
			font: font,
			timeline: timeline,
			scoreCounter: scoreCounter,
		});

		// アプリ全体のシーケンサー
		const sequencer = new PhaseSequencer({
			timeLimitSeconds: applicationTimeLimit,
			phases: [
				{ dulation: 3, phase: titlePhase },
				{ dulation: 10, phase: descriptionPhase },
				{ dulation: 2, phase: readyPhase },
				{ dulation: 60, phase: gamePhase },
				{ dulation: 3, phase: new DoNothingPhase("finish") },
				{ dulation: 10, phase: resultPhase },
			],
		});

		const progressBar = new AppProgressBar(scene);

		// 毎フレームの処理
		scene.onUpdate.add((): void => {
			sequencer.update();
			progressBar.setProgress(sequencer.currentPhaseProgress);
		});

		const finishSound = assetLoader.getAudio("/audio/whistle_finish");
		sequencer.onPhaseChanged.add((phase) => {
			if (phase === "finish") {
				finishSound.play();
				bgmPlay.stop();
			}
		});

		prepareDebugUi({ scene, sequencer, assetLoader });
	});

	g.game.pushScene(scene);
}

function createLayerEntity(scene: g.Scene): g.E {
	const entity = new g.E({
		scene: scene,
		width: g.game.width,
		height: g.game.height,
		x: 0,
		y: 0,
		parent: scene,
	});
	return entity;
}

function prepareDebugUi({
	scene,
	sequencer,
	assetLoader,
}: {
	scene: g.Scene;
	sequencer: PhaseSequencer;
	assetLoader: AssetLoader;
}): void {
	const debugPhaseLabel = new g.Label({
		scene: scene,
		text: "phase",
		font: new g.DynamicFont({
			game: g.game,
			fontFamily: "sans-serif",
			size: 20,
		}),
		x: 0,
		y: 0,
		parent: scene,
	});
	sequencer.onPhaseChanged.add((phase) => {
		console.log(`Phase changed: ${phase}`);
		debugPhaseLabel.text = phase;
		debugPhaseLabel.invalidate();
	});

	const debugSafearea = new g.Sprite({
		scene: scene,
		src: assetLoader.getImage("/image/safearea.png"),
		x: 0,
		y: 0,
		width: g.game.width,
		height: g.game.height,
		opacity: 0.5,
		parent: scene,
		touchable: false,
	});
	debugSafearea.hide();
	scene.append(debugSafearea);
}
