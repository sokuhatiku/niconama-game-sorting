import { GameMainParameterObject } from "./parameterObject"
import { createGameScene } from "./scenes/gameScene"
import { createScoreHandler } from "./scoreHandler"

export function main(param: GameMainParameterObject): void {
    let time = 60
    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit
    }

    const scoreHandler = createScoreHandler()
    const gameScene = createGameScene({
        scoreHandler: scoreHandler,
        timelimit: time,
    })
    g.game.pushScene(gameScene)
}
