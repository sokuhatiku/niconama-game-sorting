import { GameMainParameterObject } from "./parameterObject";
import { createScoreHandler } from "./scoreHandler";
import { GameCore } from "./game/gameCore";
import { Timeline } from "@akashic-extension/akashic-timeline";
import { MainSequencer } from "./mainSequencer";
import { allAssets, AssetLoader } from "./assetLoader";
import { AppProgressBar } from "./appProgressBar";
import { Layers } from "./utils/layers";
import { Title } from "./phases/title";
import { Description } from "./phases/description";

export function main(param: GameMainParameterObject): void {
    let time = 60;
    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit;
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

        const font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 64
        });

        const title = new Title({
            scene: scene,
            font: font,
        });
        title.hide();

        const description = new Description({
            scene: scene,
            font: font,
        });
        description.hide();
    
        // アプリ全体のシーケンサー
        const sequencer = new MainSequencer({
            totalAvailableTimes: time,
            gameCore: gameCore,
            title: title,
            description: description,
        });

        const progressBar = new AppProgressBar(scene);
        
        // 毎フレームの処理
        scene.onUpdate.add((): void => {
            sequencer.update();
            scoreHandler.notice(gameCore.score);
            progressBar.setProgress(sequencer.progress);
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

function prepareDebugUi({ scene, sequencer, assetLoader }: {scene: g.Scene, sequencer: MainSequencer, assetLoader: AssetLoader}): void {
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