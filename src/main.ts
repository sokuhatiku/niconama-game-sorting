import { GameMainParameterObject } from "./parameterObject";
import { createScoreHandler } from "./scoreHandler";
import { GameCore } from "./game/gameCore";
import { Timeline } from "@akashic-extension/akashic-timeline";
import { PhaseSequencer } from "./phaseSequencer";
import { allAssets, AssetLoader } from "./assetLoader";
import { AppProgressBar } from "./appProgressBar";
import { Layers } from "./utils/layers";
import { TitlePhase } from "./titlePhase";
import { DescriptionPhase } from "./descriptionPhase";
import { GamePhase } from "./game/gamePhase";
import { DoNothingPhase } from "./doNothingPhase";
import { ResultPhase } from "./resultPhase";

export function main(param: GameMainParameterObject): void {
    let applicationTimeLimit = Infinity;
    if (param.sessionParameter.totalTimeLimit) {
        applicationTimeLimit = param.sessionParameter.totalTimeLimit;
    }

    const scoreHandler = createScoreHandler();
    const scene = new g.Scene({
        game: g.game,
        assetPaths: [...allAssets],
    });
    const assetLoader = new AssetLoader(scene);

    scene.onLoad.add(() => {
        const bgm = assetLoader.getAudio("/audio/bgm");
        const bgmPlay = bgm.play();
        // レイヤー
        const layers:Layers = {
            gameBackground: createLayerEntity(scene),
            gameForeground: createLayerEntity(scene),
            gamePickups: createLayerEntity(scene),
            gameParticles: createLayerEntity(scene),
            gameUi: createLayerEntity(scene),
            debugUi: createLayerEntity(scene),
        };

        // アニメーション用のタイムライン
        const timeline = new Timeline(scene);

        // ゲームロジック
        const gameCore = new GameCore({
            scene: scene,
            timeline: timeline,
            layers: layers,
        });
        gameCore.onScoreUpdated.add((score) => {
            scoreHandler.notice(score);
        });
        const gamePhase = new GamePhase({
            gameCore: gameCore,
        });

        const font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 64
        });

        const titlePhase = new TitlePhase({
            scene: scene,
            font: font,
        });

        const descriptionPhase = new DescriptionPhase({
            scene: scene,
            font: font,
        });

        const resultPhase = new ResultPhase({
            scene: scene,
            scoreLayer: layers.gameUi,
            font: font,
        });
    
        // アプリ全体のシーケンサー
        const sequencer = new PhaseSequencer({
            timeLimitSeconds: applicationTimeLimit,
            phases: [
                { phase: titlePhase, dulation: 3 },
                { phase: descriptionPhase, dulation: 3 },
                { phase: new DoNothingPhase("ready"), dulation: 3 },
                { phase: gamePhase, dulation: 60 },
                { phase: new DoNothingPhase("finish"), dulation: 3 },
                { phase: resultPhase, dulation: 6 },
            ],
        });

        const progressBar = new AppProgressBar(scene);
        
        // 毎フレームの処理
        scene.onUpdate.add((): void => {
            sequencer.update();
            scoreHandler.notice(gameCore.score);
            resultPhase.setScore(gameCore.score);
            progressBar.setProgress(sequencer.currentPhaseProgress);
        });

        const finishSound = assetLoader.getAudio("/audio/whistle");
        sequencer.onPhaseChanged.add(phase => {
            if (phase === "finish"){
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

function prepareDebugUi({ scene, sequencer, assetLoader }: {scene: g.Scene, sequencer: PhaseSequencer, assetLoader: AssetLoader}): void {
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
    sequencer.onPhaseChanged.add(phase=> {
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
    scene.append(debugSafearea);
}