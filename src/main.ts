import { GameMainParameterObject } from "./parameterObject"
import { createScoreHandler } from "./scoreHandler"
import { GameCore } from "./game/gameCore"
import { Timeline } from "@akashic-extension/akashic-timeline"
import { MainSequencer } from "./mainSequencer"
import { AssetLoader } from "./assetLoader"
import { AppProgressBar } from "./appProgressBar"

export function main(param: GameMainParameterObject): void {
    let time = 60
    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit
    }

    const scoreHandler = createScoreHandler()
    const scene = new g.Scene({
        game: g.game,
    })
    const assetLoader = new AssetLoader(scene)

    scene.onLoad.add(() => {
        // アニメーション用のタイムライン
        const timeline = new Timeline(scene)

        // ゲームロジック
        const gameCore = new GameCore({
            scene: scene,
            timeline: timeline,
        })
    
        // アプリ全体のシーケンサー
        const sequencer = new MainSequencer({
            totalAvailableTimes: time,
            gameCore: gameCore,
        })


        const phaseDebugLabel = new g.Label({
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
        })
        sequencer.onPhaseChanged = (phase): void => {
            console.log(`Phase changed: ${phase}`)
            phaseDebugLabel.text = phase
            phaseDebugLabel.invalidate()
        }

        const safearea = new g.Sprite({
            scene: scene,
            src: assetLoader.getImage("/image/safearea.png"),
            x: 0,
            y: 0,
            width: g.game.width,
            height: g.game.height,
            opacity: 0.5,
            parent: scene,
            touchable: false,
        })
        scene.append(safearea)
        const progressBar = new AppProgressBar(scene)
        
        // 毎フレームの処理
        scene.onUpdate.add((): void => {
            sequencer.update()
            scoreHandler.notice(gameCore.score)
            progressBar.setProgress(sequencer.progress)
        })
    })

    g.game.pushScene(scene)
}
