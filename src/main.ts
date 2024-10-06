import { createGameScene } from "./scenes/gameScene"

function main(param: g.GameMainParameterObject): void {
    const gameScene = createGameScene()
    g.game.pushScene(gameScene)
}

export = main
