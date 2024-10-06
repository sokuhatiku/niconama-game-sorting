import { createGameScene } from "./scenes/gameScene"
import { createScoreHandler } from "./scoreHandler"

function main(param: g.GameMainParameterObject): void {
    const scoreHandler = createScoreHandler()
    const gameScene = createGameScene(scoreHandler)
    g.game.pushScene(gameScene)
}

export = main
